import { openDbScret } from "../../SecretDatabase/configSecretDB.js";
import jwt from 'jsonwebtoken';
const { verify } = jwt;

export default {
  method: 'delete',
  route: '/removeUser',
  run: (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", '')
    verify(token, process.env.JWT_SALT, (err, decoded) => {
      if (err)
        return res.status(401).send('Token inválido');

      openDbScret().then(async db => {

        const userMaster = decoded.id === process.env.MASTERID ? decoded.id : null

        if (!userMaster) {
          return res.status(401).json("Unauthorized")
        }
        const { user } = req.body

        if (!user) {
          return res.status(400).json({
            erro_message: "Informe um user",
            user: "",
          })
        }

        const tableExist = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='secret'")
        if (tableExist) {
          const instructionToSelectTable = `SELECT * FROM secret WHERE user='${user}'`
          const itemExist = await db.get(instructionToSelectTable)
          if (itemExist) {
            const instructionToDeleteTable = `DELETE FROM secret WHERE user='${user}'`
            db.get(instructionToDeleteTable)
            return res.status(201).json("sucess")
          }
          return res.status(404).json("Usuário não existe")
        }
        return res.status(404).json("Não há usuários cadastrados")
      })
    });
  }
}