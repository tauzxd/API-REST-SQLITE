import { createTable } from "../../Controller/sqliteQueries.js"
export default {
  method: "post",
  route: "/createTable",
  isAuthenticated: true,
  permissions: ['administrador', 'master'],
  run: async (req, res) => {
    const nameOfTable = req.body.TableName || req.body.tablename
    if (nameOfTable) {
      const regexLetters = /^[a-zA-Z0-9_]*$/

      if (!regexLetters.test(nameOfTable)) {
        return res.status(409).json("Use apenas letras e números no nome da tabela (sem espaços, apenas _ )")
      }
      const sucess = await createTable(nameOfTable)
      if (sucess) {
        return res.status(201).json("sucess")
      }
      return res.status(409).json("já existe uma tabela com este nome no banco")
    }
    return res.status(400).json({
      erro_message: "envie um nome de tabela",
      TableName: ""
    })
  }
}