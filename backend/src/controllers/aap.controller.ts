import { Request, Response } from "express";
import AAPService from "../services/aap.service";

export class AAPController {
  static async getAllAAPs(req: Request, res: Response) {
    try {
      const aaps = await AAPService.getAllAAPs();
      res.json(aaps);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des AAPs" });
    }
  }

  static async getAAPById(req: Request, res: Response) {
    try {
      const aap = await AAPService.getAAPById(req.params.id);
      if (aap) {
        res.json(aap);
      } else {
        res.status(404).json({ error: "AAP non trouvé" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'AAP" });
    }
  }

  static async getAAPByCode(req: Request, res: Response) {
    try {
      const aap = await AAPService.getAAPByCode(req.params.code);
      if (aap) {
        res.json(aap);
      } else {
        res.status(404).json({ error: "AAP non trouvé" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'AAP" });
    }
  }

  static async createAAP(req: Request, res: Response) {
    try {
      const aap = await AAPService.createAAP(req.body);
      res.status(201).json(aap);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la création de l'AAP" });
    }
  }

  static async updateAAP(req: Request, res: Response) {
    try {
      const aap = await AAPService.updateAAP(req.params.id, req.body);
      if (aap) {
        res.json(aap);
      } else {
        res.status(404).json({ error: "AAP non trouvé" });
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'AAP" });
    }
  }

  static async deleteAAP(req: Request, res: Response) {
    try {
      await AAPService.deleteAAP(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'AAP" });
    }
  }

  static async toggleAAPStatus(req: Request, res: Response) {
    try {
      const aap = await AAPService.toggleAAPStatus(req.params.id);
      if (aap) {
        res.json(aap);
      } else {
        res.status(404).json({ error: "AAP non trouvé" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors du changement de statut de l'AAP" });
    }
  }

  static async getAllTypeOrganisations(req: Request, res: Response) {
    try {
      const types = await AAPService.getAllTypeOrganisations();
      res.json(types);
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erreur lors de la récupération des types d'organisations",
        });
    }
  }

  static async createTypeOrganisation(req: Request, res: Response) {
    try {
      const type = await AAPService.createTypeOrganisation(req.body);
      res.status(201).json(type);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la création du type d'organisation" });
    }
  }
}
