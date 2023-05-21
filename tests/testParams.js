import { ScriptContext } from './contractTesting.js'
let renderedParams = '';

const goodContext = new ScriptContext();
renderedParams += '\nconst good_context = ' + goodContext.render();

const gooCtxDiffProvider = new ScriptContext();
gooCtxDiffProvider.outputs[2].asset = '"partner@bg_policy_ids"';
renderedParams += '\nconst good_ctx_diff_provider = ' + gooCtxDiffProvider.render();

// const bad_ref_token_wrong_output = new ScriptContext();
// renderedParams += '\nconst bad_ref_token_wrong_output = ' + bad_ref_token_wrong_output.render();

// const bad_ref_token_name = new ScriptContext();
// renderedParams += '\nconst bad_ref_token_name = ' + bad_ref_token_name.render();
// const bad_ref_token_label = new ScriptContext();
// renderedParams += '\nconst bad_ref_token_label = ' + bad_ref_token_label.render();
// const bad_ref_token_creds = new ScriptContext();
// renderedParams += '\nconst bad_ref_token_creds = ' + bad_ref_token_creds.render();
// const bad_ref_token_policy = new ScriptContext();
// renderedParams += '\nconst bad_ref_token_policy = ' + bad_ref_token_policy.render();
// const missing_bg_ref_input = new ScriptContext();
// renderedParams += '\nconst missing_bg_ref_input = ' + missing_bg_ref_input.render();
// const missing_pfp_ref_input = new ScriptContext();
// renderedParams += '\nconst missing_pfp_ref_input = ' + missing_pfp_ref_input.render();
// const missing_pz_ref_input = new ScriptContext();
// renderedParams += '\nconst missing_pz_ref_input = ' + missing_pz_ref_input.render();
// const handle_missing_from_inputs = new ScriptContext();
// renderedParams += '\nconst handle_missing_from_inputs = ' + handle_missing_from_inputs.render();
// const not_a_real_handle = new ScriptContext();
// renderedParams += '\nconst not_a_real_handle = ' + not_a_real_handle.render();
// const wrong_handle_name = new ScriptContext();
// renderedParams += '\nconst wrong_handle_name = ' + wrong_handle_name.render();
// const wrong_handle_label = new ScriptContext();
// renderedParams += '\nconst wrong_handle_label = ' + wrong_handle_label.render();
// const provider_fee_wrong = new ScriptContext();
// renderedParams += '\nconst provider_fee_wrong = ' + provider_fee_wrong.render();
// const provider_address_wrong = new ScriptContext();
// renderedParams += '\nconst provider_address_wrong = ' + provider_address_wrong.render();
// const provider_datum_wrong = new ScriptContext();
// renderedParams += '\nconst provider_datum_wrong = ' + provider_datum_wrong.render();
// const treasury_fee_wrong = new ScriptContext();
// renderedParams += '\nconst treasury_fee_wrong = ' + treasury_fee_wrong.render();
// const treasury_address_wrong = new ScriptContext();
// renderedParams += '\nconst treasury_address_wrong = ' + treasury_address_wrong.render();
// const treasury_datum_wrong = new ScriptContext();
// renderedParams += '\nconst treasury_datum_wrong = ' + treasury_datum_wrong.render();
// const pz_settings_wrong_address = new ScriptContext();
// renderedParams += '\nconst pz_settings_wrong_address = ' + pz_settings_wrong_address.render();
// const wrong_contract_address = new ScriptContext();
// renderedParams += '\nconst wrong_contract_address = ' + wrong_contract_address.render();
// const good_admin_ctx = new ScriptContext();
// renderedParams += '\nconst good_admin_ctx = ' + good_admin_ctx.render();
// const wrong_admin_ctx = new ScriptContext();
// renderedParams += '\nconst wrong_admin_ctx = ' + wrong_admin_ctx.render();
// const no_admin_signers_ctx = new ScriptContext();
// renderedParams += '\nconst no_admin_signers_ctx = ' + no_admin_signers_ctx.render();
// const missing_reference_token = new ScriptContext();
// renderedParams += '\nconst missing_reference_token = ' + missing_reference_token.render();




export { renderedParams };