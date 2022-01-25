import fetch from 'node-fetch';


export class PluginElasticSearch {

    private isEnabled: number;

    private client: Client ;

    constructor() {
        this.isEnabled = parseInt(process.env.ES_ENABLE) ;
    }

    isSyncEnabled(): boolean {
        return (this.isEnabled==1) ;
    }




    // Release Elastic Search Client
    // --------------------------------------

    async dispose(): Promise<void>{
        await this.client.close() ;
    }



}

