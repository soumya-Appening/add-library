const repositories = require('../../repositories')
const _ = require('lodash');

module.exports = class BaseController {
    constructor() {
        this._userRepository = new repositories.UserRepository();
        this._productRepository = new repositories.ProductRepository();
        this._brandRepository = new repositories.BrandRepository();
        this._platformRepository = new repositories.PlatformRepository();
        this._influencerRepository = new repositories.InfluencerRepository();
        this._superVisorUploaderRepository = new repositories.SupervisorUploaderRepository()
        this._adRepository = new repositories.AdRepository()
        this._leadRepository = new repositories.LeadRepository()
        this._l = _;
    }

    getRepository(name) {
        if (repositories[name]) {
            return new repositories[name];
        }

        throw new Error('Repository not found.')
    }
}
