const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

//Middleweare
function verifyIfExistsAccountCPF(request,response,next){
  const {cpf} = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer){
    return response.status(400).json({error: "Customer not found"});
  }

  request.customer = customer;

  return next();
}

app.use(express.json())

/**
 * Tipos de parâmetros
 * 
 * Route params => identificar recurso /edit/delete/search
 * Query params => Paginação / Filtro
 * Body params => Objetos inserção/alteração (JSON)
 */


/**
 * cpf - string 
 * name - string
 * id - uuid
 * statement []
 */

app.post("/account", (request, response) => {
  const {cpf,name} = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customerAlreadyExists){
    return response.status(400).json({error:"Customer already exists"})
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  });
  
  return response.status(201).send();
});

app.get("/statement",verifyIfExistsAccountCPF ,(request, response)=> {
  const {customer} = request;
  return response.json(customer.statement);
});

app.post("/deposit",verifyIfExistsAccountCPF,(request, response)=>{
  const {description,amount} = request.body;

  const {customer} = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type:"credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get("/statement/date",verifyIfExistsAccountCPF ,(request, response)=> {
  const {customer} = request;
  const {date} = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === 
  new Date(dateFormat).toDateString());

  return response.json(statement);
});

app.put("/account",verifyIfExistsAccountCPF ,(request, response) => {
  const {name} = request.body;
  const {customer} = request;

  customer.name = name;

  return response.status(201).send();
})

app.get("/account",verifyIfExistsAccountCPF,(request,response) => {
  const {customer} = request;

  return response.json(customer);
})

app.listen(3333);