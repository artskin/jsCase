function greeter(person) {
    return "hello" + person.firstName + "-" + person.lastName;
}
var user = { firstName: "Gu", lastName: 'amu' };
document.body.innerHTML = greeter(user);
