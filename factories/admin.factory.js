const { faker } = require('@faker-js/faker');
require('dotenv').config()

const getRandomInt = (max) => {
    return Math.floor((Math.random() * Math.floor(max) / 5));
}

module.exports = async () => {

    let data = [];

    for (let index = 1; index < process.env.FACTORY_COUNT; index++) {
        const admin = {
            name: faker.person.fullName(),
            // email: faker.helpers.fake('{{person.firstName}}{{person.lastName}}@yopmail.com')
            email: 'admin@yopmail.com',
        }
        data.push({
            // document name goes here 
            ...employer
        });
        
    }
    console.log(data)
    return data;
};

