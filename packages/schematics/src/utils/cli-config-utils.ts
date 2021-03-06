import { Tree } from '@angular-devkit/schematics';

export function getWorkspacePath(host: Tree) {
  const possibleFiles = ['/angular.json', '/.angular.json'];
  return possibleFiles.filter(path => host.exists(path))[0];
}

export function getNpmScope(host: Tree) {
  return JSON.parse(host.read('nx.json')!.toString('utf-8')).npmScope;
}

export function parseTarget(targetString: string) {
  const [project, target, config] = targetString.split(':');
  return {
    project,
    target,
    config
  };
}

export function editTarget(targetString: string, callback) {
  const parsedTarget = parseTarget(targetString);
  return serializeTarget(callback(parsedTarget));
}

export function serializeTarget({ project, target, config }) {
  return [project, target, config].filter(part => !!part).join(':');
}

export function replaceAppNameWithPath(
  node: any,
  appName: string,
  root: string
): any {
  if (typeof node === 'string') {
    const matchPattern = new RegExp(
      `([^a-z0-9]+(${appName}))|((${appName})[^a-z0-9:]+)`,
      'gi'
    );
    if (!!node.match(matchPattern)) {
      const r = node.replace(appName, root);
      return r.startsWith('/apps') || r.startsWith('/libs')
        ? r.substring(1)
        : r;
    } else {
      return node;
    }
  } else if (Array.isArray(node)) {
    return node.map(j => replaceAppNameWithPath(j, appName, root));
  } else if (typeof node === 'object' && node) {
    return Object.keys(node).reduce(
      (m, c) => ((m[c] = replaceAppNameWithPath(node[c], appName, root)), m),
      {} as any
    );
  } else {
    return node;
  }
}
