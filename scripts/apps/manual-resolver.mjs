export default class ManualResolver extends FormApplication {

    constructor(terms, roll, callback) {
        super({});
        this.terms = terms;
        this.roll = roll;
        this.callback = callback;
    }

    /* -------------------------------------------- */

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "manual-resolver",
            template: "modules/unfulfilled-rolls/templates/manual-resolver.hbs",
            title: "Manual Resolver",
            popOut: true,
            width: 720,
            submitOnChange: false,
            submitOnClose: true,
            closeOnSubmit: true
        });
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options={}) {
        const context = await super.getData(options);

        context.terms = this.terms;
        context.roll = this.roll;
        console.debug("Terms: ", context.terms);

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    _getSubmitData(updateData = {}) {
        const data = super._getSubmitData(updateData);

        // Find all input fields and add placeholder values to inputs with no value
        const inputs = this.form.querySelectorAll("input");
        for ( const input of inputs ) {
            if ( !input.value ) {
                data[input.name] = input.placeholder;
            }
        }

        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    async _updateObject(event, formData) {
        // Turn the entries into a map
        const fulfilled = new Map();
        for ( const [id, result] of Object.entries(formData) ) {
            // Parse the result as a number
            console.debug("id: ", id, " Number: ", Number(result));
            const rollResult = Number(result);
            if(!this.validateRoll(id, rollResult)) {
                console.debug("Invalid value for dice roll, using random instead.", rollResult, id);
                continue;
            }
            fulfilled.set(id, rollResult);
        }
        this.callback(fulfilled);
    }

    validateRoll(diceId, rollResult) {
        if (rollResult < 1) {
            console.debug("Rolled result lower than minimum value ", diceId, rollResult);
            return false;
        }
        var diceSizePlusId = diceId.replace(/^\D+/g, ''); 
        var diceSize = diceSizePlusId.split('-')[0];
        if (Number(diceSize) < rollResult) {
            console.debug("Rolled result higher than max value", diceId, rollResult);
            return false;
        }
        return true;
    }
}
