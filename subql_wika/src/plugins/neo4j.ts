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

    async handleLikeEvent(): Promise<void>{

    }

    async dispose(): Promise<void>{
        await this.session.close() ;
        await this.driver.close() ;
    }



}

