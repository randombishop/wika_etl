import fetch from 'node-fetch';


/**
* Sends an email using an API
*/
export class PluginEmails {

    private _isEnabled: number;
    private host: string;
    private fromEmail: string ;
    private toEmail: string ;
    private apiKey: string ;

    /**
    * Constructor relies on env vars `EMAIL_ALERT_ENABLE`, `EMAIL_ALERT_HOST`,
    * `EMAIL_ALERT_FROM`, `EMAIL_ALERT_TO` and `EMAIL_ALERT_KEY`
    */
    constructor() {
        this._isEnabled = parseInt(process.env.EMAIL_ALERT_ENABLE) ;
        if (this._isEnabled==1) {
            this.host = process.env.EMAIL_ALERT_HOST ;
            this.fromEmail = process.env.EMAIL_ALERT_FROM ;
            this.toEmail = process.env.EMAIL_ALERT_TO ;
            this.apiKey = process.env.EMAIL_ALERT_KEY ;
        }
    }

    /**
    * Returns the state of the plugin configured by env variable `EMAIL_ALERT_ENABLE`
    * @returns true/false
    */
    isEnabled(): boolean {
        return (this._isEnabled==1) ;
    }

    /**
    * Prepares the payload and calls the API to send the errorMessage as an email.
    * @param errorMessage - Message to send
    * @returns the API result
    */
    async sendError(errorMessage) {
        const subject = "Wika ETL alert" ;
        const payload = {
            "personalizations": [{"to": [{"email": this.toEmail}]}],
            "from": {"email": this.fromEmail},
            "subject": subject,
            "content": [{"type": "text/plain", "value": errorMessage}]
        } ;
        const config = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.apiKey
            },
            body: JSON.stringify(payload)
        } ;
        const response = await fetch(this.host, config);
        return response ;
    }

}




