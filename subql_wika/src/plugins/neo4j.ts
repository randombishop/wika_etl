import neo4j from "neo4j-driver" ;
import Driver from 'neo4j-driver/lib/driver.js'
import Session from 'neo4j-driver-core/lib/session.js'


export class PluginNeo4j {

    private isEnabled: number;

    private driver: Driver ;

    constructor() {
        console.log('NEO4J_ENABLE', process.env.NEO4J_ENABLE) ;
        this.isEnabled = parseInt(process.env.NEO4J_ENABLE) ;
        if (this.isEnabled==1) {
            const host = process.env.NEO4J_HOST ;
            console.log('NEO4j_HOST', host) ;
            const user = process.env.NEO4J_USER ;
            console.log('NEO4J_USER', user) ;
            const password = process.env.NEO4J_PASS ;
            this.driver = neo4j.driver(host, neo4j.auth.basic(user, password));
        }
    }

    isSyncEnabled(): boolean {
        return (this.isEnabled==1) ;
    }

    async fetchUrlNode(url: string) {
        const session = this.driver.session() ;
        const result = await session.run(
            'MATCH (a:Url {url: $url}) RETURN a',
            { url: url }
        )
        let node = null ;
        if (result.records.length==1) {
            const singleRecord = result.records[0] ;
            node = singleRecord.get(0).properties  ;
        }
        await session.close() ;
        return node ;
    }

    async createUrlNode(url: string, numLikes: number) {
        const session = this.driver.session() ;
        const result = await session.run(
            'CREATE (a:Url {url: $url, numLikes: $numLikes}) RETURN a',
            {url: url, numLikes: numLikes}
        )
        const singleRecord = result.records[0]
        const node = singleRecord.get(0).properties ;
        await session.close() ;
        return node ;
    }

    async updateUrlNode(url: string, numLikes: number) {
        const session = this.driver.session() ;
        await session.run(
            'MATCH (a:Url {url: $url}) SET a.numLikes=a.numLikes+$numLikes',
            {url: url, numLikes: numLikes}
        ) ;
        await session.close() ;
    }

    async fetchUserNode(address: string) {
        const session = this.driver.session() ;
        const result = await session.run(
            'MATCH (a:User {address: $address}) RETURN a',
            {address: address}
        )
        let node = null ;
        if (result.records.length==1) {
            const singleRecord = result.records[0]
            node = singleRecord.get(0).properties
        }
        await session.close() ;
        return node ;
    }

    async createUserNode(address: string, numLikes: number) {
        const session = this.driver.session() ;
        const result = await session.run(
            'CREATE (a:User {address: $address, numLikes: $numLikes}) RETURN a',
            {address: address, numLikes: numLikes}
        )
        const singleRecord = result.records[0]
        const node = singleRecord.get(0).properties
        await session.close() ;
        return node ;
    }

    async updateUserNode(address: string, numLikes: number) {
        const session = this.driver.session() ;
        await session.run(
            'MATCH (a:User {address: $address}) SET a.numLikes=a.numLikes+$numLikes',
            {address: address, numLikes: numLikes}
        )
        await session.close() ;
    }

    async fetchRelation(url: string, address: string) {
        const session = this.driver.session() ;
        const result = await session.run(
            'MATCH (a:User {address: $address})-[r:LIKES]->(a:Url {url: $url}) RETURN r',
            {url: url, address: address}
        )
        let relation = null ;
        if (result.records.length==1) {
            const singleRecord = result.records[0]
            relation = singleRecord.get(0).properties
        }
        await session.close() ;
        return relation ;
    }

    async createRelation(address: string, url: string, numLikes: number) {
        const session = this.driver.session() ;
        let cql = "MATCH (a:User {address: $address}) " ;
        cql += "MATCH (b:Url {url: $url}) " ;
        cql += "CREATE (a)-[r:LIKES {numLikes: $numLikes}]->(b) RETURN r" ;
        const result = await session.run(cql,
            {address: address, url: url, numLikes: numLikes}
        )
        const singleRecord = result.records[0] ;
        const node = singleRecord.get(0).properties  ;
        await session.close() ;
        return node ;
    }

    async updateRelation(address: string, url: string, numLikes: number) {
        const session = this.driver.session() ;
        let cql = "MATCH (a:User {address: $address})-[r:LIKES {numLikes: $numLikes}]->(b:Url {url: $url}) " ;
        cql+= "SET r.numLikes = r.numLikes + $numLikes"
        await session.run(
            'MATCH (a:User {address: $address}) SET a.numLikes=a.numLikes+$numLikes',
            {address: address, url: url, numLikes: numLikes}
        ) ;
        await session.close() ;
    }

    async handleLikeEvent(url: string, user: string, numLikes: number): Promise<void>{
        logger.debug('handleLikeEvent', url, user, numLikes) ;

        // Create or update Url
        let urlNode = await this.fetchUrlNode(url) ;
        if (urlNode==null) {
            urlNode = await this.createUrlNode(url, numLikes) ;
        } else {
            await this.updateUrlNode(url, numLikes) ;
        }
        logger.debug('urlNode', urlNode) ;

        // Create or update User
        let userNode = await this.fetchUserNode(user) ;
        if (userNode==null) {
            userNode = await this.createUserNode(user, numLikes) ;
        } else {
            await this.updateUserNode(user, numLikes) ;
        }
        logger.debug('userNode', userNode) ;

        // Create or update the relationship
        let relation = await this.fetchRelation(url, user) ;
        if (relation==null) {
            relation = await this.createRelation(user, url, numLikes) ;
        } else {
            await this.updateRelation(user, url, numLikes) ;
        }
        logger.debug('relation', relation) ;
    }

    async dispose(): Promise<void>{
        await this.driver.close() ;
    }



}

