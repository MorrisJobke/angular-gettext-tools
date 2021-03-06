var po = require('pofile');
var _ = require('lodash');

var formats = {
    javascript: {
        addLocale: function (locale, strings) {
            return "    gettextCatalog.setStrings('" + locale + "', " + (JSON.stringify(strings)) + ");\n";
        },
        format: function (locales, options) {
            return "angular.module(\"" + options.module + "\").run(['gettextCatalog', function (gettextCatalog) {\n" + locales.join('') + "\n}]);";
        }
    },
    json: {
        addLocale: function (locale, strings) {
            return {name: locale, strings: strings};
        },
        format: function (locales, options) {
            var result = {};
            locales.forEach(function (locale) {
                result[locale.name] = locale.strings;
            });
            return JSON.stringify(result);
        }
    }
};

var Compiler = (function () {
    function Compiler(options) {
        this.options = _.extend({
            format: 'javascript',
            module: 'gettext'
        }, options);
    }

    Compiler.hasFormat = function (format) {
        return formats.hasOwnProperty(format);
    };

    Compiler.prototype.convertPo = function (inputs) {
        var format = formats[this.options.format];
        var locales = [];

        inputs.forEach(function (input) {
            var catalog = po.parse(input);

            if (!catalog.headers.Language) {
                throw new Error('No Language header found!');
            }

            var strings = {};
            for (var i = 0; i < catalog.items.length; i++) {
                var item = catalog.items[i];
                strings[item.msgid] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
            }

            locales.push(format.addLocale(catalog.headers.Language, strings));

        });
        
        return format.format(locales, this.options);
    };

    return Compiler;
})();

module.exports = Compiler;
