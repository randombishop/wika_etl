import neo4j from "neo4j-driver" ;
import Driver from 'neo4j-driver/lib/driver.js'
import Session from 'neo4j-driver-core/lib/session.js'


export class PluginNeo4j {

    private isEnabled: number;

    private driver: Driver ;

    private session: Session ;

    constructor() {
        this.isEnabled = parseInt(process.env.NEO4J_ENABLE) ;
        if (this.isEnabled==1) {
            const host = process.env.NEO4j_HOST ;
            const user = process.env.NEO4j_USER ;
            const password = process.env.NEO4j_PASS ;
            this.driver = neo4j.driver(host, neo4j.auth.basic(user, password));
            this.session = this.driver.session() ;
        }
    }

    isSyncEnabled(): boolean {
        return (this.isEnabled==1) ;
    }

    async fetchUrlNode(url: string) {
        const result = await this.session.run(
            'MATCH (a:Url {url: $url}) RETURN a',
            { url: url }
        )
        if (result.records.length==1) {
            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
            return node ;
        } else {
            return null ;
        }
    }

    async createUrlNode(url: string, numLikes: number) {
        const result = await this.session.run(
            'CREATE (a:Url {url: $url, numLikes: $numLikes}) RETURN a',
            {url: url, numLikes: numLikes}
        )
        const singleRecord = result.records[0]
        const node = singleRecord.get(0)
        return node ;
    }

    async updateUrlNode(url: string, numLikes: number) {
        await this.session.run(
            'MATCH (a:Url {url: $url}) SET a.numLikes=a.numLikes+$numLikes',
            {url: url, numLikes: numLikes}
        )
    }

    async fetchUserNode(address: string) {
        const result = await this.session.run(
            'MATCH (a:User {address: $address}) RETURN a',
            {address: address}
        )
        if (result.records.length==1) {
            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
            return node ;
        } else {
            return null ;
        }
    }

    async createUserNode(address: string, numLikes: number) {
        const result = await this.session.run(
            'CREATE (a:User {address: $address, numLikes: $numLikes}) RETURN a',
            {address: address, numLikes: numLikes}
        )
        const singleRecord = result.records[0]
        const node = singleRecord.get(0)
        return node ;
    }

    async updateUserNode(address: string, numLikes: number) {
        await this.session.run(
            'MATCH (a:User {address: $address}) SET a.numLikes=a.numLikes+$numLikes',
            {address: address, numLikes: numLikes}
        )
    }

    async fetchRelation(url: string, address: string) {
        const result = await this.session.run(
            'MATCH (a:User {address: $address})-[r:LIKES]->(a:Url {url: $url}) RETURN r',
            {url: url, address: address}
        )
        if (result.records.length==1) {
            const singleRecord = result.records[0]
            const relation = singleRecord.get(0)
            return relation ;
        } else {
            return null ;
        }
    }

    async createRelation(address: string, url: string, numLikes: number) {
        let cql = "MATCH (a:User {address: $address}) " ;
        cql += "MATCH (b:Url {url: $url}) " ;
        cql += "CREATE (a)-[r:LIKES {numLikes: $numLikes}]->(b) RETURN r" ;
        const result = await this.session.run(cql,
            {address: address, url: url, numLikes: numLikes}
        )
        const singleRecord = result.records[0]
        const node = singleRecord.get(0)
        return node ;
    }

    async updateRelation(address: string, url: string, numLikes: number) {
        let cql = "MATCH (a:User {address: $address})-[r:LIKES {numLikes: $numLikes}]->(b:Url {url: $url}) " ;
        cql+= "SET r.numLikes = r.numLikes + $numLikes"
        await this.session.run(
            'MATCH (a:User {address: $address}) SET a.numLikes=a.numLikes+$numLikes',
            {address: address, url: url, numLikes: numLikes}
        )
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
        await this.session.close() ;
        await this.driver.close() ;
    }



}

