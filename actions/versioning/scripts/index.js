const core = require('@actions/core');

function incrementVersion(version, type, branchId) {
    const [major, minor, patch] = version.split('.');
    switch (type) {
        case 'pre':
            const preVersion = patch.split('.').pop();
            return `${major}.${minor}.${patch}-${branchId}.pre-${Number(preVersion) + 1}`;
        case 'patch':
            return `${major}.${minor}.${Number(patch) + 1}`;
        case 'minor':
            return `${major}.${Number(minor) + 1}.0`;
        case 'major':
            return `${Number(major) + 1}.0.0`;
        default:
            throw new Error(`Unknown version strategy type: ${type}`);
    }
}

function calculateVersion(baseVersion, branchName, bumpType = 'patch') {
    if (baseVersion === undefined) {
        baseVersion = '0.0.0';
    }

    if (['main', 'master'].includes(branchName)) {
        return incrementVersion(baseVersion, bumpType);
    }

    const branchId = branchName.replace('/[^a-z0-9]/gi', '-').toLowerCase();
    return `${incrementVersion(baseVersion, 'pre', branchId)}`;
}

try {
    const baseVersion = core.getInput('base_version');
    const branchName = core.getInput('branch_name');
    const bumpType = core.getInput('bump_type');
    const versionPrefix = core.getInput('version_prefix');

    const newVersion = calculateVersion(baseVersion, branchName, bumpType);

    core.setOutput('new_version', versionPrefix + newVersion);
} catch (error) {
    core.setFailed(error.message);
}