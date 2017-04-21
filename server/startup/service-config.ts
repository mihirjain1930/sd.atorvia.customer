import { Meteor } from "meteor/meteor";

declare var ServiceConfiguration:any;

ServiceConfiguration.configurations.remove({
    service: 'facebook'
});
ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: '212229312591853',
    display: 'popup',
    secret: 'f1eb07dd41bf154b741ae9daceb7ef17'
});
