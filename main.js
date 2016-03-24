'use strict';

const fs = require('fs');
const path = require('path');

function list_npm_modules () {
  return fs.readdirSync('./node_modules');
}

function read_package_info (basepath, pkg) {
  const pkg_path = path.join(basepath, pkg, 'package.json');

  const content = fs.readFileSync(pkg_path, 'utf-8');

  return JSON.parse(content);
}

function get_synthetic_infos (pkg_info) {
  return {
    author: pkg_info._npmUser && pkg_info._npmUser.name || 'unknown',
    name: pkg_info.name
  };
}

function reduce_to_pkg_by_author (pkg_by_author, pkg_infos) {
  const author = pkg_infos.author;

  pkg_by_author[author] = pkg_by_author[author] || [];

  pkg_by_author[author].push(pkg_infos.name);

  return pkg_by_author;
}

const deps_by_author = list_npm_modules()
                  .filter(name => name[0] !== '.')
                  .map((pkg) => read_package_info('./node_modules', pkg))
                  .map(get_synthetic_infos)
                  .reduce(reduce_to_pkg_by_author, {});

function get_stats (deps_by_author) {
  const authors = Object.keys(deps_by_author);

  const stats_by_author = authors.reduce((stats, author) => {
    stats[author] = deps_by_author[author].length;

    return stats;
  }, {});

  return stats_by_author;
}

function prettify_result (stats) {
  const authors = Object.keys(stats);

  return authors.reduce((result, author) => {
    return `${result}${author} => ${stats[author]} modules\n`;
  });
}

const stats = get_stats(deps_by_author);

console.log('Here are the deps of your project grouped by author');
console.log('===================================================');
console.log(prettify_result(stats));
