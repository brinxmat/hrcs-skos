'use strict'
const fs = require('fs')

const base_uri = 'https://nva.unit.no/hrcs/'
const en_input = JSON.parse(fs.readFileSync('hrcs.en.json'));
const nb_input = JSON.parse(fs.readFileSync('hrcs.nb.json'));
const output = [];
console.log(en_input);
en_input.forEach(item => merge(item));

function merge(item) {
     const identifier = item.identifier;
     const en_label = item.label.en;
     const nb_counterpart = nb_input.find(input => input.identifier === identifier);

     if (identifier.length === 1) {
         output.push(createTopLevel(identifier, en_label, nb_counterpart.label.nb));
     } else {
         const x = output.find(input => input.identifier === identifier.substring(0, 1));
         x.subcategories.push(createElement(identifier, en_label,  nb_counterpart.label.nb));
     }
}

function createTopLevel(identifier, en_label, nb_label) {
    return {
        'id': base_uri + identifier,
        'type': 'HrcsConcept',
        'identifier': identifier,
        'label': {
            'en': en_label,
            'nb': nb_label
        },
        subcategories: []
    };
}

function createElement(identifier, en_label, nb_label) {
    return {
        'id': base_uri + identifier,
        'type': 'HrcsConcept',
        'identifier': identifier,
        'label': {
            'en': en_label,
            'nb': nb_label
        }
    };
}

function wrapWithJsonLd(content) {
    return {
        '@context': {
            '@vocab': 'http://www.w3.org/2004/02/skos/core#',
            'id': '@id',
            'type': '@type',
            'categories': '@graph',
            'HrcsConcept': 'Concept',
            'subcategories': 'narrower',
            'label': {
                '@id': 'prefLabel',
                '@container': '@language'
            },
            'identifier': 'http://purl.org/dc/terms/identifier'
        },
        'categories': content
    };
}

const data = JSON.stringify(wrapWithJsonLd(output));
fs.writeFileSync('hrcs.json', data);