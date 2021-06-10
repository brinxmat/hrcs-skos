'use strict'
const fs = require('fs')

const en_input = JSON.parse(fs.readFileSync('hrcs_activity.en.json'));
const nb_input = JSON.parse(fs.readFileSync('hrcs_activity.nb.json'));
convertCategories();
const en_health_input = JSON.parse(fs.readFileSync('hrcs_health.en.json'));
const nb_health_input = JSON.parse(fs.readFileSync('hrcs_health.nb.json'));
convertHealth();

function convertCategories() {
    const output = [];
    en_input.forEach(item => merge(item, output));
}

function convertHealth() {
    const output = [];
    en_health_input.forEach(item => mergeHealth(item, output));
}

function merge(item, output) {
    const base_uri = 'https://nva.unit.no/hrcs/activity/'
    const identifier = item.identifier;
    const en_label = item.label.en;
    const nb_counterpart = nb_input.find(input => input.identifier === identifier);

    if (identifier.length === 1) {
        output.push(createTopLevel(identifier, en_label, nb_counterpart.label.nb, base_uri));
    } else {
        const x = output.find(input => input.identifier === identifier.substring(0, 1));
        x.subcategories.push(createElement(identifier, en_label,  nb_counterpart.label.nb, base_uri));
    }
    const data = JSON.stringify(wrapWithJsonLd(output));
    fs.writeFileSync('hrcs_activity.json', data);
}

function mergeHealth(item, output) {
    const base_uri = 'https://nva.unit.no/hrcs/health/'
    const identifier = item.identifier;
    const en_label = item.label.en;
    const nb_counterpart = nb_health_input.find(input => input.identifier === identifier);
    output.push(createElement(identifier, en_label,  nb_counterpart.label.nb, base_uri));
    const data = JSON.stringify(wrapWithJsonLd(output));
    fs.writeFileSync('hrcs_health.json', data);
}

function createTopLevel(identifier, en_label, nb_label, base_uri) {
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

function createElement(identifier, en_label, nb_label, base_uri) {
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