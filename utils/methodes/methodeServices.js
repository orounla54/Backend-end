const { poolPromise, sql } = require("../../db"); // Importer poolPromise

// Fonction pour récupérer l'idResponsable
async function pullIdResponsable(req, res) {
  try {
    const id = req.auth.id; // Assurez-vous que req.auth.id contient bien l'identifiant du profil
    const pool = await poolPromise;

    const resultProfile = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT idResponsable FROM Profiles WHERE id = @id");

    // Vérification si le profil existe
    if (resultProfile.recordset.length === 0) {
      return res.status(404).json({ message: "Profil non trouvé." });
    }

    // Récupération de l'idResponsable
    const idResponsable = resultProfile.recordset[0].idResponsable;

    const resultResp = await pool
      .request()
      .input("id", sql.Int, idResponsable)
      .query("SELECT * FROM Responsables WHERE id = @id");

    // Vérification si le responsables existe
    if (resultResp.recordset.length === 0) {
      return res.status(404).json({ message: "Profil non trouvé." });
    }

    return idResponsable; // Retourne l'idResponsable pour utilisation ultérieure
  } catch (error) {
    console.error("Erreur lors de la récupération de l'idResponsable :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

async function pullIdServices(req, res) {
  try {
    const id = req.auth.id; // Assurez-vous que req.auth.id contient bien l'identifiant du profil
    const pool = await poolPromise;

    const resultProfile = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT idResponsable FROM Profiles WHERE id = @id");

    // Vérification si le profil existe
    if (resultProfile.recordset.length === 0) {
      return res.status(404).json({ message: "Profil non trouvé." });
    }

    // Récupération de l'idResponsable
    const idResponsable = resultProfile?.recordset[0].idResponsable;

    const serviceResponsable = await pool
      .request()
      .input("idResponsable", sql.Int, idResponsable).query(`
      SELECT s.id
      FROM Services s
      JOIN Responsables_Postes_Services rsp ON s.id = rsp.idService
      WHERE rsp.idResponsable = @idResponsable
    `);

    if (!serviceResponsable.recordset.length) {
      return res.status(404).json({
        error: true,
        message: "Service introuvable pour ce responsable.",
      });
    }

    const idService = serviceResponsable.recordset?.[0]?.id;

    if (!idService) {
      console.error("No service ID found in the query results.");
      // Traitez le cas où `idService` est indéfini ou nul
    } else {
      // console.log("Service ID:", idService);
    }

    return idService; // Retourne l'idResponsable pour utilisation ultérieure
  } catch (error) {
    console.error("Erreur lors de la récupération de l'idResponsable :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

async function updateEventsStatus(idEvent) {
  try {
    const pool = await poolPromise;

    await pool.request().input("idEvent", sql.Int, idEvent).query(`
        UPDATE Evenements
        SET status = (
            CASE
                WHEN GETDATE() < eventStart THEN 'Non-démaré'  -- Non-démarré si la date actuelle est avant la date de début
                WHEN GETDATE() BETWEEN eventStart AND eventEnd THEN 'En-cours'  -- En-cours si on est entre la date de début et de fin
                WHEN GETDATE() > eventEnd THEN 'Terminé'  -- Terminé si la date actuelle est après la date de fin
                ELSE status -- Garder le statut existant par défaut
            END
        )
        WHERE id = @idEvent;
        `);
    // WHERE id = @idEvent AND status <> 'Terminé';

    // console.log(`Statut de l'événement ID ${idEvent} mis à jour avec succès.`);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du statut de l'événement ID ${idEvent}:`,
      error.message
    );
    throw error; // Relancer l'erreur si besoin
  }
}

async function updateSollicitationStatus(idSollicitation) {
  try {
    const pool = await poolPromise;

    // Vérifier l'état des tâches associées à la sollicitation
    const result = await pool
      .request()
      .input("idSollicitation", sql.Int, idSollicitation).query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN st.libelle = 'En-cours' THEN 1 ELSE 0 END) AS enCours,
               SUM(CASE WHEN st.libelle = 'Terminé' THEN 1 ELSE 0 END) AS termine
        FROM Taches t
        INNER JOIN Status_Taches st ON st.id = t.idStatusTache
        WHERE t.idSollicitation = @idSollicitation;
      `);

    console.log("passer");
    const { total, enCours, termine } = result.recordset[0];

    let newStatus = "Non-démarré"; // Par défaut

    if (total > 0) {
      if (termine === total) {
        newStatus = "Traitée"; // Toutes les tâches sont terminées
      } else if (enCours > 0) {
        newStatus = "En-cours de traitement"; // Au moins une tâche en cours
      } else {
        newStatus = "En-cours de traitement"; // Au moins une tâche en cours
      }
    }

    // Vérifier si la sollicitation est "statisfaire"
    const sollicitationResult = await pool
      .request()
      .input("idSollicitation", sql.Int, idSollicitation)
      .query(
        `SELECT satisfaire FROM Sollicitations WHERE id = @idSollicitation;`
      );

    const statisfaire = sollicitationResult.recordset[0].satisfaire;

    console.log(statisfaire);
    // Si "statisfaire" est vrai (ou non null), forcer le statut "Traitée"
    if (statisfaire === true) {
      newStatus = "Traitée";
    }

    // Mettre à jour la sollicitation en une seule requête
    await pool
      .request()
      .input("idSollicitation", sql.Int, idSollicitation)
      .input("newStatus", sql.VarChar, newStatus).query(`
        UPDATE Sollicitations
        SET status = @newStatus
        WHERE id = @idSollicitation;
      `);

    console.log(
      `Statut de la sollicitation ID ${idSollicitation} mis à jour en "${newStatus}".`
    );
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du statut de la sollicitation ID ${idSollicitation}:`,
      error.message
    );
    throw error;
  }
}

async function updateEventsFilesConStatus(idFileConducteur) {
  try {
    const pool = await poolPromise;

    await pool.request().input("idFileConducteur", sql.Int, idFileConducteur)
      .query(`
      UPDATE Evenements_Files_Conducteurs
      SET status = (
          CASE
              WHEN GETDATE() < DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', heureDebut), CAST(date AS DATETIME)) 
                  THEN 'Non-démarré'
              WHEN GETDATE() BETWEEN DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', heureDebut), CAST(date AS DATETIME)) 
                                  AND DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', heureFin), CAST(date AS DATETIME)) 
                  THEN 'En-cours'
              WHEN GETDATE() > DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', heureFin), CAST(date AS DATETIME)) 
                  THEN 'Terminé'
              ELSE status
          END
      )
      WHERE id = @idFileConducteur;
    `);

    // console.log(`Statut de l'événement ID ${idEvent} mis à jour avec succès.`);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du statut de l'événement ID ${idEvent}:`,
      error.message
    );
    throw error; // Relancer l'erreur si besoin
  }
}

//verifaction si le login existe deja dans la base de donées
async function checkLoginExist(login) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("login", sql.NVarChar, login)
      .query("SELECT * FROM Profiles WHERE login = @login");
    if (result.recordset.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'existence du login :",
      error
    );
  }
}

async function checkResponsableExist(idResponsable) {
  const pool = await poolPromise;
  const responsableExiste = await pool
    .request()
    .input("idResponsable", sql.Int, idResponsable)
    .query("SELECT 1 FROM Responsables WHERE id = @idResponsable");

  if (responsableExiste.recordset.length === 0) {
    return res.status(404).json({
      error: true,
      message: "Responsable introuvable.",
    });
  }
  return responsableExiste.recordset[0];
}

// Méthode pour mettre à jour le statut des parents jusqu'à Plans_Strategiques
async function updatePlanStrategiqueStatus(idPlanStrategique) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  await transaction.begin(); // Démarrer la transaction
  try {
    // Vérifier l'état des tâches associées au Plan Stratégique
    const result = await transaction
      .request()
      .input("idPlanStrategique", sql.Int, idPlanStrategique).query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN axs.status = 'En-cours' THEN 1 ELSE 0 END) AS enCours,
               SUM(CASE WHEN axs.status = 'Terminé' THEN 1 ELSE 0 END) AS termine
        FROM Axes_Strategiques axs
        WHERE axs.idPlanStrategique = @idPlanStrategique;
      `);

    const { total, enCours, termine } = result.recordset[0];

    let newStatus = "Non-démarré";

    if (total > 0) {
      if (termine === total) {
        newStatus = "Terminé";
      } else if (enCours > 0 || termine > 0) {
        newStatus = "En-cours";
      }
    }

    // Calcul du percentageCompletion
    let percentage;
    if (total > 0) {
      percentage = ((termine / total) * 100).toFixed(1);
    } else {
      percentage = "0.00";
    }

    // Mettre à jour le statut du Plan Stratégique
    await transaction
      .request()
      .input("idPlanStrategique", sql.Int, idPlanStrategique)
      .input("percentageCompletion", sql.Float, percentage)
      .input("newStatus", sql.VarChar, newStatus).query(`
        UPDATE Plans_Strategiques
        SET 
          status = @newStatus,
          percentageCompletion = @percentageCompletion
        WHERE id = @idPlanStrategique;
      `);
    await transaction.commit(); // Valider la transaction
  } catch (error) {
    await transaction.rollback(); // Annuler la transaction en cas d'erreur
    console.error(
      `Erreur lors de la mise à jour du statut du Plan Stratégique ID ${idPlanStrategique}:`,
      error.message
    );
    throw error;
  }
}

// Méthode pour mettre à jour l'axe stratégique
async function updateAxesStatus(idAxeStrategique) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  await transaction.begin(); // Démarrer la transaction
  try {
    const result = await transaction
      .request()
      .input("idAxeStrategique", sql.Int, idAxeStrategique).query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN os.status = 'En-cours' THEN 1 ELSE 0 END) AS enCours,
               SUM(CASE WHEN os.status = 'Terminé' THEN 1 ELSE 0 END) AS termine
        FROM Objectifs_Strategiques os
        WHERE os.idAxe = @idAxeStrategique;
      `);

    const { total, enCours, termine } = result.recordset[0];

    let newStatus = "Non-démarré";

    if (total > 0) {
      if (termine === total) {
        newStatus = "Terminé";
      } else if (enCours > 0 || termine > 0) {
        newStatus = "En-cours";
      }
    }

    // Calcul du percentageCompletion
    let percentage;
    if (total > 0) {
      percentage = ((termine / total) * 100).toFixed(1);
    } else {
      percentage = "0.00";
    }

    await transaction
      .request()
      .input("idAxeStrategique", sql.Int, idAxeStrategique)
      .input("percentageCompletion", sql.Float, percentage)
      .input("newStatus", sql.VarChar, newStatus).query(`
        UPDATE Axes_Strategiques
        SET 
          status = @newStatus,
          percentageCompletion = @percentageCompletion
        WHERE id = @idAxeStrategique;
      `);

    // Mettre à jour les objectifs stratégiques
    const plansStrategiquesResult = await transaction
      .request()
      .input("idAxeStrategique", sql.Int, idAxeStrategique).query(`
        SELECT idPlanStrategique
        FROM Axes_Strategiques
        WHERE id = @idAxeStrategique;
      `);

    await transaction.commit(); // Valider la transaction

    for (const plan of plansStrategiquesResult.recordset) {
      await updatePlanStrategiqueStatus(plan.idPlanStrategique);
    }
  } catch (error) {
    await transaction.rollback(); // Annuler la transaction en cas d'erreur
    console.error(
      `Erreur lors de la mise à jour de l'Axe Stratégique ID ${idAxeStrategique}:`,
      error.message
    );
    throw error;
  }
}

// Méthode pour mettre à jour l'objectif stratégique
async function updateObjectifsStrategiquesStatus(idObjectifStrategique) {
  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin(); // Démarrer la transaction

    const result = await transaction
      .request()
      .input("idObjectifStrategique", sql.Int, idObjectifStrategique).query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN ms.status = 'En-cours' THEN 1 ELSE 0 END) AS enCours,
               SUM(CASE WHEN ms.status = 'Terminé' THEN 1 ELSE 0 END) AS termine
        FROM Mesures_Strategiques ms
        WHERE ms.idObjectifStrategique = @idObjectifStrategique;
      `);

    const { total, enCours, termine } = result.recordset[0];

    let newStatus = "Non-démarré";

    if (total > 0) {
      if (termine === total) {
        newStatus = "Terminé";
      } else if (enCours > 0 || termine > 0) {
        newStatus = "En-cours";
      }
    }

    // Calcul du percentageCompletion
    let percentage;
    if (total > 0) {
      percentage = ((termine / total) * 100).toFixed(1);
    } else {
      percentage = "0.00";
    }

    await transaction
      .request()
      .input("idObjectifStrategique", sql.Int, idObjectifStrategique)
      .input("percentageCompletion", sql.Float, percentage)
      .input("newStatus", sql.VarChar, newStatus).query(`
        UPDATE Objectifs_Strategiques
        SET 
          status = @newStatus,
          percentageCompletion = @percentageCompletion
        WHERE id = @idObjectifStrategique;
      `);

    // Mettre à jour les mesures stratégiques
    const mesuresResult = await transaction
      .request()
      .input("idObjectifStrategique", sql.Int, idObjectifStrategique).query(`
        SELECT idAxe
        FROM Objectifs_Strategiques
        WHERE id = @idObjectifStrategique;
      `);
    await transaction.commit(); // Valider la transaction

    for (const mesure of mesuresResult.recordset) {
      await updateAxesStatus(mesure.idAxe);
    }
  } catch (error) {
    await transaction.rollback(); // Annuler la transaction en cas d'erreur
    console.error(
      `Erreur lors de la mise à jour de l'Objectif Stratégique ID ${idObjectifStrategique}:`,
      error.message
    );
    throw error;
  }
}

// Méthode pour mettre à jour la mesure stratégique
async function updateMesureStatus(idMesureStrategique) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin(); // Démarrer la transaction

  try {
    const result = await transaction
      .request()
      .input("idMesureStrategique", sql.Int, idMesureStrategique).query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN oo.status = 'En-cours' THEN 1 ELSE 0 END) AS enCours,
               SUM(CASE WHEN oo.status = 'Terminé' THEN 1 ELSE 0 END) AS termine
        FROM Objectifs_Operationnels oo
        WHERE oo.idMesure = @idMesureStrategique;
      `);

    const { total, enCours, termine } = result.recordset[0];

    let newStatus = "Non-démarré";

    if (total > 0) {
      if (termine === total) {
        newStatus = "Terminé";
      } else if (enCours > 0 || termine > 0) {
        newStatus = "En-cours";
      }
    }

    // Calcul du percentageCompletion
    let percentage;
    if (total > 0) {
      percentage = ((termine / total) * 100).toFixed(1);
    } else {
      percentage = "0.00";
    }

    await transaction
      .request()
      .input("idMesureStrategique", sql.Int, idMesureStrategique)
      .input("percentageCompletion", sql.Float, percentage)
      .input("newStatus", sql.VarChar, newStatus).query(`
        UPDATE Mesures_Strategiques
        SET 
          status = @newStatus,
          percentageCompletion = @percentageCompletion
        WHERE id = @idMesureStrategique;
      `);

    // Mettre à jour les objectifs opérationnels
    const objectifsStrategiquesjResult = await transaction
      .request()
      .input("idMesureStrategique", sql.Int, idMesureStrategique).query(`
        SELECT 
          idObjectifStrategique
        FROM Mesures_Strategiques
        WHERE id = @idMesureStrategique;
      `);
    await transaction.commit(); // Valider la transaction

    for (const objectifStrategique of objectifsStrategiquesjResult.recordset) {
      await updateObjectifsStrategiquesStatus(
        objectifStrategique.idObjectifStrategique
      );
    }
  } catch (error) {
    await transaction.rollback(); // Annuler la transaction en cas d'erreur
    console.error(
      `Erreur lors de la mise à jour de la Mesure Stratégique ID ${idMesureStrategique}:`,
      error.message
    );
    throw error;
  }
}

// Méthode pour mettre à jour l'objectif opérationnel
async function updateObjectifsOperationnelsStatus(idObjectifOperationnel) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin(); // Démarrer la transaction

  try {
    const result = await transaction
      .request()
      .input("idObjectifOperationnel", sql.Int, idObjectifOperationnel).query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN p.status = 'En-cours' THEN 1 ELSE 0 END) AS enCours,
               SUM(CASE WHEN p.status = 'Terminé' THEN 1 ELSE 0 END) AS termine
        FROM Priorites p
        WHERE p.idObjectifOperationnel = @idObjectifOperationnel;
      `);

    const { total, enCours, termine } = result.recordset[0];

    let newStatus = "Non-démarré";

    if (total > 0) {
      if (termine === total) {
        newStatus = "Terminé";
      } else if (enCours > 0 || termine > 0) {
        newStatus = "En-cours";
      }
    }

    // Calcul du percentageCompletion
    let percentage;
    if (total > 0) {
      percentage = ((termine / total) * 100).toFixed(1);
    } else {
      percentage = "0.00";
    }

    await transaction
      .request()
      .input("idObjectifOperationnel", sql.Int, idObjectifOperationnel)
      .input("percentageCompletion", sql.Float, percentage)
      .input("newStatus", sql.VarChar, newStatus).query(`
        UPDATE Objectifs_Operationnels
        SET 
          status = @newStatus,
          percentageCompletion = @percentageCompletion
        WHERE id = @idObjectifOperationnel;
      `);

    // Mettre à jour les mesures stratégiques
    const mesuresResult = await transaction
      .request()
      .input("idObjectifOperationnel", sql.Int, idObjectifOperationnel).query(`
        SELECT 
         idMesure
        FROM Objectifs_Operationnels
        WHERE id = @idObjectifOperationnel;
      `);

    await transaction.commit(); // Valider la transaction

    for (const mesure of mesuresResult.recordset) {
      await updateMesureStatus(mesure.idMesure);
    }
  } catch (error) {
    await transaction.rollback(); // Annuler la transaction en cas d'erreur

    console.error(
      `Erreur lors de la mise à jour de l'Objectif Opérationnel ID ${idObjectifOperationnel}:`,
      error.message
    );
    throw error;
  }
}

async function updatePrioriteStatus(idPriorite) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  await transaction.begin(); // Démarrer la transaction

  try {
    // Vérifier l'état des tâches associées à la sollicitation
    const result = await transaction
      .request()
      .input("idPriorite", sql.Int, idPriorite).query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN st.libelle = 'En-cours' THEN 1 ELSE 0 END) AS enCours,
               SUM(CASE WHEN st.libelle = 'Terminé' THEN 1 ELSE 0 END) AS termine
        FROM Taches t
        INNER JOIN Status_Taches st ON st.id = t.idStatusTache
        WHERE t.idPriorite = @idPriorite;
      `);

    const { total, enCours, termine } = result.recordset[0];

    let newStatus = "Non-démarré"; // Par défaut
    // Vérification si la priorité existe
    const prioriteRe = await transaction
      .request()
      .input("id", sql.Int, idPriorite)
      .query("SELECT * FROM Priorites WHERE id = @id");

    if (prioriteRe.recordset.length === 0) {
      return res.status(404).json({ message: "Priorité introuvable." });
    }
    const priorite = prioriteRe.recordset[0];

    // Vérification si la priorité est démarrée
    if (total > 0) {
      if (termine === total || enCours > 0 || termine > 0) {
        newStatus = "En-cours"; // Toutes les tâches sont terminées
      }
    } else {
      newStatus = "Non-démarré"; // Sinon, non démarré
    }

    if (priorite.status === "Terminé") {
      newStatus = "Terminé";
    }
    // Calcul du percentageCompletion
    let percentage;
    if (total > 0) {
      percentage = ((termine / total) * 100).toFixed(1);
    } else {
      percentage = "0.00";
    }

    // Mettre à jour la Priorité
    await transaction
      .request()
      .input("idPriorite", sql.Int, idPriorite)
      .input("newStatus", sql.VarChar, newStatus)
      .input("percentageCompletion", sql.Float, percentage).query(`
        UPDATE Priorites
        SET 
          status = @newStatus,
          percentageCompletion = @percentageCompletion
        WHERE id = @idPriorite;
      `);

    // Mettre à jour objectifs opereationnels
    const objectifsOpResult = await transaction
      .request()
      .input("idPriorite", sql.Int, idPriorite).query(`
      SELECT 
       idObjectifOperationnel
      FROM Priorites
      WHERE id = @idPriorite;
    `);

    await transaction.commit(); // Valider la transaction

    for (const objectifsOp of objectifsOpResult.recordset) {
      await updateObjectifsOperationnelsStatus(
        objectifsOp.idObjectifOperationnel
      );
    }

    console.log(
      `Statut de la priorité ID ${idPriorite} mis à jour en "${newStatus}".`
    );
  } catch (error) {
    await transaction.rollback(); // Annuler la transaction en cas d'erreur
    console.error(
      `Erreur lors de la mise à jour du statut de la priorité ID ${idPriorite}:`,
      error.message
    );
    throw error;
  }
}

module.exports = {
  pullIdResponsable,
  updateEventsStatus,
  checkLoginExist,
  checkResponsableExist,
  pullIdServices,
  updateEventsFilesConStatus,
  updateSollicitationStatus,
  updatePlanStrategiqueStatus,
  updateAxesStatus,
  updateObjectifsStrategiquesStatus,
  updateMesureStatus,
  updateObjectifsOperationnelsStatus,
  updatePrioriteStatus,
};
