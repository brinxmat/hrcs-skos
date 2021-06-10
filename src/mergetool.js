'use strict'
const fs = require('fs')

const activity_en_input = JSON.parse(fs.readFileSync('hrcs_activity.en.json'));
const activity_nb_input = JSON.parse(fs.readFileSync('hrcs_activity.nb.json'));
convertActivities();
const category_en_input = JSON.parse(fs.readFileSync('hrcs_category.en.json'));
const category_nb_input = JSON.parse(fs.readFileSync('hrcs_category.nb.json'));
convertCategory();

function convertActivities() {
    const output = [];
    activity_en_input.forEach(item => mergeActivity(item, output));
}

function convertCategory() {
    const output = [];
    category_en_input.forEach(item => mergeCategory(item, output));
}

function mergeActivity(item, output) {
    const base_uri = 'https://nva.unit.no/hrcs/activity/'
    const identifier = item.identifier;
    const en_label = item.label.en;
    const nb_counterpart = activity_nb_input.find(input => input.identifier === identifier);

    if (identifier.length === 1) {
        output.push(createTopLevel(identifier, en_label, nb_counterpart.label.nb, base_uri));
    } else {
        const x = output.find(input => input.identifier === identifier.substring(0, 1));
        x.subcategories.push(createElement(identifier, en_label,  nb_counterpart.label.nb, base_uri));
    }
    const data = JSON.stringify(wrapWithJsonLd(output));
    fs.writeFileSync('hrcs_activity.json', data);
}

function mergeCategory(item, output) {
    const base_uri = 'https://nva.unit.no/hrcs/category/'
    const identifier = item.identifier;
    const en_label = item.label.en;
    const nb_counterpart = category_nb_input.find(input => input.identifier === identifier);
    output.push(createElement(identifier, en_label,  nb_counterpart.label.nb, base_uri));
    const data = JSON.stringify(wrapWithJsonLd(output));
    fs.writeFileSync('hrcs_category.json', data);
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