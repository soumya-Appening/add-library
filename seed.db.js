require("./config/database");
/** Factories */
const jobfactory = require('./factories/job.factory')
const jobsahayakfactory = require('./factories/jobSahayak.factory')
/**End Factories */
const factories = {
    jobfactory,
    jobsahayakfactory
};
const factoryName = process.argv[2] ? process.argv[2].toLowerCase() : process.argv[2];
(async () => {
    try {
        console.log(factoryName)
        if (factoryName && factories[factoryName]) {
            await factories[factoryName].call();
        } else {
            console.log('else')
            //Manual calling
        }
        process.exit(0);
    } catch (e) {
        console.log(e)
        process.exit(0);
    }
})();