"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiContentProvider = void 0;
const review_uri_1 = require("./review_uri");
const gitlab_new_service_1 = require("../gitlab/gitlab_new_service");
const log_1 = require("../log");
const git_service_factory_1 = require("../git_service_factory");
class ApiContentProvider {
    // eslint-disable-next-line class-methods-use-this
    provideTextDocumentContent(uri, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = review_uri_1.fromReviewUri(uri);
            if (!params.path || !params.commit)
                return '';
            const instanceUrl = yield git_service_factory_1.createGitService(params.workspacePath).fetchCurrentInstanceUrl();
            const service = new gitlab_new_service_1.GitLabNewService(instanceUrl);
            try {
                return service.getFileContent(params.path, params.commit, params.projectId);
            }
            catch (e) {
                log_1.logError(e);
                throw e;
            }
        });
    }
}
exports.ApiContentProvider = ApiContentProvider;
//# sourceMappingURL=api_content_provider.js.map