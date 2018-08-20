interface Person{
  firstName:string;
  lastName:string;
}

function greeter(person :Person){
  return "hello"+ person.firstName +"-"+person.lastName;
}

let user = {firstName:"Gu",lastName:'amu'};

document.body.innerHTML = greeter(user)