import { expect } from 'chai';
import { PluginEmails } from '../plugins/emails';


const emails = new PluginEmails() ;

const testMessage = 'Integration test message\nPlease ignore...' ;

describe('PluginEmails', function () {

    it('should send a test email', async function () {
        await emails.sendError(testMessage) ;
    });

});