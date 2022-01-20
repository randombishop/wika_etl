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

    getFirstRecord(result) {
        let node = null ;
        if (result.records.length>0) {
            const singleRecord = result.records[0] ;
            node = singleRecord.get(0).properties  ;
        }
        return node ;
    }

    async runQueyAndGetFirstRecord(cql: string, params: object) {
        //console.log(cql,params) ;
        const session = this.driver.session() ;
        const result = await session.run(cql, params) ;
        const record = this.getFirstRecord(result) ;
        await session.close() ;
        //console.log('--->', record) ;
        return record ;
    }

    async runQuey(cql: string, params: object) {
        const session = this.driver.session() ;
        await session.run(cql, params) ;
        await session.close() ;
    }



    // URL CRUD FUNCTIONS
    // ------------------

    async fetchUrl(url: string) {
        const cql = 'MATCH (a:Url {url: $url}) RETURN a' ;
        const params = { url: url } ;
        const node = await this.runQueyAndGetFirstRecord(cql, params) ;
        return node ;
    }

    async createUrl(url: string, numLikes: number) {
        const cql = 'CREATE (a:Url {url: $url, numLikes: $numLikes}) RETURN a' ;
        const params = {url: url, numLikes: numLikes} ;
        const node = await this.runQueyAndGetFirstRecord(cql, params) ;
        return node ;
    }

    async updateUrl(url: string, numLikes: number) {
        const cql = 'MATCH (a:Url {url: $url}) SET a.numLikes=a.numLikes+$numLikes RETURN a';
        const params = {url: url, numLikes: numLikes} ;
        const node = await this.runQueyAndGetFirstRecord(cql, params) ;
        return node ;
    }

    async deleteUrl(url: string) {
        const cql = 'MATCH (a:Url {url: $url}) DETACH DELETE a' ;
        const params = { url: url } ;
        await this.runQuey(cql, params) ;
    }



    // User CRUD FUNCTIONS
    // ---------------------

    async fetchUser(address: string) {
        const cql = 'MATCH (a:User {address: $address}) RETURN a';
        const params = {address: address} ;
        const node = await this.runQueyAndGetFirstRecord(cql, params) ;
        return node ;
    }

    async createUser(address: string, numLikes: number) {
        const cql = 'CREATE (a:User {address: $address, numLikes: $numLikes}) RETURN a' ;
        const params = {address: address, numLikes: numLikes} ;
        const node = await this.runQueyAndGetFirstRecord(cql, params) ;
        return node ;
    }

    async updateUser(address: string, numLikes: number) {
        const cql = 'MATCH (a:User {address: $address}) SET a.numLikes=a.numLikes+$numLikes RETURN a' ;
        const params = {address: address, numLikes: numLikes} ;
        const node = await this.runQueyAndGetFirstRecord(cql, params) ;
        return node ;
    }

    async deleteUser(address: string) {
        const cql = 'MATCH (a:User {address: $address}) DETACH DELETE a' ;
        const params = {address: address} ;
        await this.runQuey(cql, params) ;
    }




    // USER->URL LIKES Relation CRUD FUNCTIONS
    // --------------------------------------

    async fetchLIKES(address: string, url: string) {
        const cql = 'MATCH (a:User {address: $address})-[r:LIKES]->(b:Url {url: $url}) RETURN r' ;
        const params = {address: address, url: url} ;
        const relation = await this.runQueyAndGetFirstRecord(cql, params) ;
        return relation ;
    }

    async createLIKES(address: string, url: string, numLikes: number) {
        let cql = "MATCH (a:User {address: $address}) " ;
        cql += "MATCH (b:Url {url: $url}) " ;
        cql += "CREATE (a)-[r:LIKES {numLikes: $numLikes}]->(b) RETURN r" ;
        const params = {address: address, url: url, numLikes: numLikes} ;
        const relation = await this.runQueyAndGetFirstRecord(cql, params) ;
        return relation ;
    }

    async updateLIKES(address: string, url: string, numLikes: number) {
        let cql = "MATCH (a:User {address: $address})-[r:LIKES]->(b:Url {url: $url}) " ;
        cql += "SET r.numLikes = r.numLikes + $numLikes " ;
        cql += "return r" ;
        const params = {address: address, url: url, numLikes: numLikes} ;
        const relation = await this.runQueyAndGetFirstRecord(cql, params) ;
        return relation ;
    }

    async deleteLIKES(address: string, url: string) {
        const cql = 'MATCH (a:User {address: $address})-[r:LIKES]->(b:Url {url: $url}) DELETE r' ;
        const params = {address: address, url: url} ;
        await this.runQuey(cql, params) ;
    }




    // handleLikeEvent
    // --------------------------------------

    async handleLikeEvent(user: string, url: string, numLikes: number): Promise<void>{
        // Create or update Url
        let urlNode = await this.fetchUrl(url) ;
        if (urlNode==null) {
            urlNode = await this.createUrl(url, numLikes) ;
        } else {
            urlNode = await this.updateUrl(url, numLikes) ;
        }

        // Create or update User
        let userNode = await this.fetchUser(user) ;
        if (userNode==null) {
            userNode = await this.createUser(user, numLikes) ;
        } else {
            userNode = await this.updateUser(user, numLikes) ;
        }

        // Create or update the relationship
        let relation = await this.fetchLIKES(user, url) ;
        if (relation==null) {
            relation = await this.createLIKES(user, url, numLikes) ;
        } else {
            await this.updateLIKES(user, url, numLikes) ;
        }
    }



    // Release Neo4j Driver
    // --------------------------------------

    async dispose(): Promise<void>{
        await this.driver.close() ;
    }



}

