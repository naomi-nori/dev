"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const commands_1 = require("./commands");
const report_1 = require("./report");
const decoration_1 = require("./decoration");
function activate(context, didChangeEditor) {
    const auditContext = {};
    const pendingAudits = {};
    didChangeEditor(([editor, version]) => {
        if (editor) {
            const uri = editor.document.uri.toString();
            let combinedDecorations = [];
            for (const audit of Object.values(auditContext)) {
                for (const [decorationsUri, decoration] of Object.entries(audit.decorations)) {
                    if (uri == decorationsUri) {
                        combinedDecorations = combinedDecorations.concat(decoration);
                    }
                }
                editor.setDecorations(decoration_1.decorationType, combinedDecorations);
                if (auditContext[uri]) {
                    report_1.ReportWebView.showIfVisible(auditContext[uri]);
                }
                else {
                    let subdocument = false;
                    for (const audit of Object.values(auditContext)) {
                        if (audit.summary.subdocumentUris.includes(uri)) {
                            subdocument = true;
                        }
                    }
                    // display no report only if the current document is not a
                    // part of any multi-document run
                    if (!subdocument) {
                        report_1.ReportWebView.showNoReport(context);
                    }
                }
            }
        }
    });
    commands_1.registerSecurityAudit(context, auditContext, pendingAudits);
    commands_1.registerFocusSecurityAudit(context, auditContext);
    commands_1.registerFocusSecurityAuditById(context, auditContext);
}
exports.activate = activate;
//# sourceMappingURL=activate.js.map