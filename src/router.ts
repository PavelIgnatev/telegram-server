import { Router } from "express";
import { getRecipient, postRecipient } from "./controllers/recipient";

const mainRouter: Router = Router();

mainRouter.get("/recipient", getRecipient);
mainRouter.post("/recipient", postRecipient);

export { mainRouter };
