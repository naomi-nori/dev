"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangedFileItem = void 0;
const vscode_1 = require("vscode");
const path_1 = require("path");
const review_uri_1 = require("../../review/review_uri");
const command_names_1 = require("../../command_names");
const getChangeTypeIndicator = (diff) => {
    if (diff.new_file)
        return '[added] ';
    if (diff.deleted_file)
        return '[deleted] ';
    if (diff.renamed_file)
        return '[renamed] ';
    return '';
};
// Common image types https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.tiff',
    '.bmp',
    '.avif',
    '.apng',
];
const looksLikeImage = (filePath) => imageExtensions.includes(path_1.posix.extname(filePath).toLowerCase());
class ChangedFileItem extends vscode_1.TreeItem {
    constructor(mr, mrVersion, file, project) {
        super(vscode_1.Uri.file(file.new_path));
        // TODO add FileDecorationProvider once it is available in the 1.52 https://github.com/microsoft/vscode/issues/54938
        this.description = `${getChangeTypeIndicator(file)}${path_1.posix.dirname(`/${file.new_path}`)}`;
        this.mr = mr;
        this.mrVersion = mrVersion;
        this.project = project;
        this.file = file;
        if (looksLikeImage(file.old_path) || looksLikeImage(file.new_path)) {
            this.command = {
                title: 'Images are not supported',
                command: command_names_1.PROGRAMMATIC_COMMANDS.NO_IMAGE_REVIEW,
            };
            return;
        }
        const emptyFileUri = review_uri_1.toReviewUri({ workspacePath: project.uri, projectId: mr.project_id });
        const baseFileUri = file.new_file
            ? emptyFileUri
            : review_uri_1.toReviewUri({
                path: file.old_path,
                commit: mrVersion.base_commit_sha,
                workspacePath: project.uri,
                projectId: mr.project_id,
            });
        const headFileUri = file.deleted_file
            ? emptyFileUri
            : review_uri_1.toReviewUri({
                path: file.new_path,
                commit: mrVersion.head_commit_sha,
                workspacePath: project.uri,
                projectId: mr.project_id,
            });
        this.command = {
            title: 'Show changes',
            command: command_names_1.VS_COMMANDS.DIFF,
            arguments: [baseFileUri, headFileUri, `${path_1.posix.basename(file.new_path)} (!${mr.iid})`],
        };
    }
}
exports.ChangedFileItem = ChangedFileItem;
//# sourceMappingURL=changed_file_item.js.map