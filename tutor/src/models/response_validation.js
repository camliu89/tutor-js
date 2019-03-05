import {
  BaseModel, identifiedBy, action, computed, field, identifier, hasMany,
} from 'shared/model';

const ResponseValidationConfig = {
  url: null,
};

@identifiedBy('response_validation')
class ResponseValidation extends BaseModel {

  static bootstrap(config) {
    Object.assign(ResponseValidationConfig, config);
  }

  @field bad_word_count;
  @field common_word_count;
  @field computation_time;
  @field domain_word_count;
  @field inner_product;
  @field innovation_word_count;
  @field processed_response;
  @field remove_nonwords;
  @field remove_stopwords;
  @field response;
  @field spelling_correction;
  @field tag_numeric;
  @field valid;

  validate({ response, uid = '' }) {
    if (!ResponseValidationConfig.url) { return 'ABORT'; }

    return {
      url: ResponseValidationConfig.url,
      query: {
        uid,
        response,
        spelling_correction: 'True',
        remove_stopwords: 'True',
        remove_nonwords: 'True',
      },
    };
  }

  @action onValidationComplete({ data }) {
    this.update(data);
  }

}

export { ResponseValidation };