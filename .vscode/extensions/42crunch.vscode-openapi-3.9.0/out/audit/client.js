"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = exports.requestToken = void 0;
const got_1 = __importDefault(require("got"));
const form_data_1 = __importDefault(require("form-data"));
const ASSESS_URL = 'https://stateless.apisecurity.io/api/v1/anon/assess/vscode';
const TOKEN_URL = 'https://stateless.apisecurity.io/api/v1/anon/token';
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
function requestToken(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield got_1.default(TOKEN_URL, {
            body: { email },
            form: true,
            headers: {
                Accept: 'application/json',
            },
        });
        return JSON.parse(response.body);
    });
}
exports.requestToken = requestToken;
function submitAudit(text, apiToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = new form_data_1.default();
        form.append('specfile', text, {
            filename: 'swagger.json',
            contentType: 'application/json',
        });
        const response = yield got_1.default(ASSESS_URL, {
            body: form,
            headers: {
                Accept: 'application/json',
                'X-API-TOKEN': apiToken,
            },
        });
        return JSON.parse(response.body);
    });
}
function retryAudit(token, apiToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield got_1.default(`ASSESS_URL?token=${token}`, {
            headers: {
                Accept: 'application/json',
                'X-API-TOKEN': apiToken,
            },
        });
        return JSON.parse(response.body);
    });
}
function audit(text, apiToken, progress) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield submitAudit(text, apiToken);
        if (result.status === 'IN_PROGRESS') {
            for (let attempt = 0; attempt < 20; attempt++) {
                yield delay(5000);
                if (attempt === 2) {
                    progress.report({
                        message: 'Processing takes longer than expected, please wait...',
                    });
                }
                const retry = yield retryAudit(result.token, apiToken);
                if (retry.status === 'PROCESSED') {
                    result = retry;
                    break;
                }
            }
        }
        if (result.status === 'PROCESSED') {
            return [readSummary(result.report), readAssessment(result.report)];
        }
        throw new Error('Failed to retrieve audit result');
    });
}
exports.audit = audit;
function readSummary(assessment) {
    const grades = {
        datavalidation: {
            value: Math.round(assessment.data ? assessment.data.score : 0),
            max: 70,
        },
        security: {
            value: Math.round(assessment.security ? assessment.security.score : 0),
            max: 30,
        },
        oasconformance: {
            value: 0,
            max: 0,
        },
        all: 0,
        errors: false,
        invalid: false,
    };
    if (assessment.semanticErrors || assessment.validationErrors) {
        grades.errors = true;
    }
    if (assessment.openapiState === 'fileInvalid') {
        grades.invalid = true;
    }
    grades.all = grades.datavalidation.value + grades.security.value + grades.oasconformance.value;
    return grades;
}
function readAssessment(assessment) {
    let issues = [];
    const jsonPointerIndex = assessment.index;
    function transformScore(score) {
        const rounded = Math.abs(Math.round(score));
        if (score === 0) {
            return '0';
        }
        else if (rounded >= 1) {
            return rounded.toString();
        }
        return 'less than 1';
    }
    function transformIssues(issues, defaultCriticality = 5) {
        const result = [];
        for (const id of Object.keys(issues)) {
            const issue = issues[id];
            for (const subIssue of issue.issues) {
                result.push({
                    id,
                    description: subIssue.specificDescription ? subIssue.specificDescription : issue.description,
                    pointer: jsonPointerIndex[subIssue.pointer],
                    score: subIssue.score ? Math.abs(subIssue.score) : 0,
                    displayScore: transformScore(subIssue.score ? subIssue.score : 0),
                    criticality: issue.criticality ? issue.criticality : defaultCriticality,
                });
            }
        }
        return result;
    }
    if (assessment.data) {
        issues = issues.concat(transformIssues(assessment.data.issues));
    }
    if (assessment.security) {
        issues = issues.concat(transformIssues(assessment.security.issues));
    }
    if (assessment.warnings) {
        issues = issues.concat(transformIssues(assessment.warnings.issues, 1));
    }
    if (assessment.semanticErrors) {
        issues = issues.concat(transformIssues(assessment.semanticErrors.issues));
    }
    if (assessment.validationErrors) {
        issues = issues.concat(transformIssues(assessment.validationErrors.issues));
    }
    issues.sort((a, b) => b.score - a.score);
    return issues;
}
//# sourceMappingURL=client.js.map