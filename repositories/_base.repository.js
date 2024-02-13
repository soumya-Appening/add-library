module.exports = class BaseRepository {
    constructor() {
        this._session = null
    }
    
    setDBSession(session) {
        this._session = session;
    }


    paginate = async ({
        model,
        sort = { field: 'createdAt', order: -1 },
        aggregation = [],
        pageNumber = 1,
        pageSize = 20,
        filters = [],
        project = null,
        addFields = null,
        lookup = []
    }) => {
        try {

            // if (filters.length > 0) {
            //     //TODO: Add Filter
            //     filters.forEach(filter => {
            //         aggregation.unshift({
            //             $match: {
            //                 [filter.field]: { $regex: "" }
            //             }
            //         })
            //     });
            // }
            
            if (filters.hasOwnProperty('match')) {
                aggregation.unshift({
                    $match: filters['match']
                })
            }
            if (lookup.length > 0) {
                aggregation.push(...lookup)
            }

            if(addFields){
                aggregation.push({
                    $addFields:addFields
                })
            }

            if(project){
                aggregation.push({
                    $project:project
                })
            }

            console.log(aggregation)

            const countPipeline = [...aggregation, { $count: 'totalDocuments' }];
            const countResult = await model.aggregate(countPipeline);

            const totalDocuments = countResult.length > 0 ? countResult[0].totalDocuments : 0;
            const totalPages = Math.ceil(totalDocuments / pageSize);
            if (pageNumber < 1) {
                throw new Error('Invalid page number');
            }

            const pipeline = [
                ...aggregation,
                { $sort: { [sort.field]: sort.order } },
                { $skip: (pageNumber - 1) * pageSize },
                { $limit: pageSize }
            ];
            const documents = await model.aggregate(pipeline).collation({ locale: "en", caseLevel: true });

            return {
                pageNumber,
                pageSize,
                totalPages,
                totalDocuments,
                documents
            };
        } catch (error) {
            throw new Error(`Pagination failed: ${error.message}`);
        }
    };


}