# Fuzzy-filter

[![Build Status](https://secure.travis-ci.org/stratuseditor/fuzzy-filter.png)](http://travis-ci.org/stratuseditor/fuzzy-filter)

A [browserify](https://github.com/substack/node-browserify)-compatible
fuzzy string filtering function.

Used by [Stratus Editor](http://stratuseditor.com/) for the Snap Open plugin.

# Parameters

    pattern - The fuzzy String to match against.
    items   - An Array of String.
    options - (optional)
            * pre         - String to insert before matching text.
            * post        - String to insert after matching text.
            * limit       - Integer maximum number of results.
            * separator   - String separator. Match against the last
                            section of the String by default.
            * ignorecase  - Boolean (default: true).
            * ignorespace - Boolean (default: true).
            * separate    - Boolean (default: false). If set to true, the
                            function returns an array of an array of strings,
                            where each array is
                            [beforeLastSeparator, afterLastSeparator].
                            If set, `separator` must also be passed.

Note: If `pre` is passed, you also have to pass `post` (and vice-versa).

# Examples
## Simple usage

    var fuzzy = require('fuzzy-filter')
    fuzzy("cs", ["cheese", "pickles", "crackers", "pirate attack", "cs!!"])
    // => ["cs!!", "cheese", "crackers"]

## Highlight match

    fuzzy("cs", ["cheese", "pickles", "crackers", "pirate attack", "cs!!"],
      { pre:  "<b>"
      , post: "</b>" })
    // => ["<b>cs</b>!!", "<b>c</b>hee<b>s</b>e", "<b>c</b>racker<b>s</b>"]

## Separator

    fuzzy("cs", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
      { pre:       "<b>"
      , post:      "</b>"
      , separator: "/" })
    // => [ "<b>c</b>ookie<b>s</b>"
    //    , "fried/<b>c</b>hee<b>s</b>e"
    //    , "cheese/<b>c</b>ookie<b>s</b>" ]

    fuzzy("cs/", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
      { pre:       "<b>"
      , post:      "</b>"
      , separator: "/"})
    // => [ "<b>c</b>hee<b>s</b>e/pie"
    //    , "<b>c</b>hee<b>s</b>e/cookies" ]
  
    fuzzy("cs/p", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
      { pre:       "<b>"
      , post:      "</b>"
      , separator: "/"})
    // => ["<b>c</b>hee<b>s</b>e/<b>p</b>ie"]
  
    fuzzy("cs/p", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
      { pre:       "<b>"
      , post:      "</b>"
      , separator: "/"
      , separate:  true })
    // => [ ["<b>c</b>hee<b>s</b>e", "<b>p</b>ie"] ]


# License
See LICENSE.

