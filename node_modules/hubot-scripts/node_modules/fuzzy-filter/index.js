module.exports = fuzzy

// Public: Filter a list of items.
// 
// pattern - The fuzzy String to match against.
// items   - An Array of String.
// options - (optional)
//         * pre         - String to insert before matching text.
//         * post        - String to insert after matching text.
//         * limit       - Integer maximum number of results.
//         * separator   - String separator. Match against the last
//                         section of the String by default.
//         * ignorecase  - Boolean (default: true).
//         * ignorespace - Boolean (default: true).
//         * separate    - Boolean (default: false). If set to true, the
//                         function returns an array of an array of strings,
//                         where each array is
//                         [beforeLastSeparator, afterLastSeparator].
//                         If set, `separator` must also be passed.
// 
// Note: If `pre` is passed, you also have to pass `post` (and vice-versa).
// 
// Examples
// 
//   var fuzzy = require('fuzzy-filter')
//   fuzzy("cs", ["cheese", "pickles", "crackers", "pirate attack", "cs!!"])
//   // => ["cs!!", "cheese", "crackers"]
// 
//   fuzzy("cs", ["cheese", "pickles", "crackers", "pirate attack", "cs!!"],
//   { pre:  "<b>"
//   , post: "</b>"})
//   // => ["<b>cs</b>!!", "<b>c</b>hee<b>s</b>e", "<b>c</b>racker<b>s</b>"]
// 
//   fuzzy("cs", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
//   { pre:       "<b>"
//   , post:      "</b>"
//   , separator: "/"})
//   // => [ "<b>c</b>ookie<b>s</b>"
//   //    , "fried/<b>c</b>hee<b>s</b>e"
//   //    , "cheese/<b>c</b>ookie<b>s</b>" ]
// 
//   fuzzy("cs/", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
//   { pre:       "<b>"
//   , post:      "</b>"
//   , separator: "/"})
//   // => [ "<b>c</b>hee<b>s</b>e/pie"
//   //    , "<b>c</b>hee<b>s</b>e/cookies" ]
// 
//   fuzzy("cs/p", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
//   { pre:       "<b>"
//   , post:      "</b>"
//   , separator: "/"})
//   // => ["<b>c</b>hee<b>s</b>e/<b>p</b>ie"]
// 
//   fuzzy("cs/p", ["cookies", "cheese/pie", "fried/cheese", "cheese/cookies"],
//   { pre:       "<b>"
//   , post:      "</b>"
//   , separator: "/"
//   , separate:  true})
//   // => [ ["<b>c</b>hee<b>s</b>e", "<b>p</b>ie"] ]
// 
// Returns an Array of String.
function fuzzy(pattern, items, options) {
  options || (options = {})
  var pre = options.pre
    , post = options.post
    , limit = options.limit
    , ignorecase = options.ignorecase
    , ignorespace = options.ignorespace
    , separator = options.separator
    , separate = options.separate
    , inner, isMatch, item, len, parts
    , postPart, postSep, postSepRegex, preParts, preParts, preSep, preSepRegex

  if (ignorecase == null) ignorecase = true
  if (ignorespace == null) ignorespace = true
  if (separate == null) separate = false
  if (separate && !separator) {
    throw new Error("You must pass a separator when options.separate is true.")
  }
  if (ignorespace) pattern = pattern.replace(/\s/g, "")

  var matches = []
    , flags = (ignorecase && "i") || ""
    , doHighlight = pre && post

  // before - The matched text before the last separator.
  // after  - The matched text after the last separator.
  // method - "unshift" or "push"
  function addMatch(before, after, method) {
    if (separate) {
      matches[method]([before, after])
    } else {
      if (before) {
        matches[method](before + separator + after)
      } else {
        matches[method](after)
      }
    }
  }

  // Internal: Add a match to the end of the matches Array.
  // Returns nothing.
  function appendMatch(before, after) {
    addMatch(before, after, "push")
  }

  // Internal: Prepend a match to the matches Array.
  // Returns nothing.
  function prependMatch (before, after) {
    addMatch(before, after, "unshift")
  }

  if (separator) {
    preParts = pattern.split(separator)
    postPart = preParts.pop()
    prePart = preParts.join(separator)
    inner = preParts.map(function(p) { return makePattern(p) })
    inner = inner.join(".*?" + separator + ".*?")
    preSepRegex = new RegExp("^.*?" + inner + ".*?$", flags)
  } else {
    preParts = false
    postPart = pattern
    preSepRegex = false
  }

  postSepRegex = new RegExp("^.*?" + (makePattern(postPart)) + ".*$", flags)
  for (var i = 0; i < items.length; i++) {
    item = items[i]
    if (matches.length === limit) break
    var hasTextBeforeSeparator = separator && !!~item.indexOf(separator)

    // Match the beginning of the item.
    if (!hasTextBeforeSeparator && item.indexOf(pattern) === 0) {
      if (doHighlight) {
        len = pattern.length
        prependMatch("", pre + item.slice(0, len) + post + item.slice(len))
      } else {
        prependMatch("", item)
      }
      continue
    }

    if (hasTextBeforeSeparator) {
      parts = item.split(separator)
      preSep = parts.slice(0, -1).join(separator)
      postSep = parts[parts.length - 1]
    } else {
      preSep = ""
      postSep = item
    }

    // Match the part before the last separator.
    isMatch = !preSepRegex || preSepRegex.test(preSep)
    // Match the part after the last separator.
    isMatch && (isMatch = !postSepRegex || postSepRegex.test(postSep))
    if (!isMatch) {
      continue
    }

    if (doHighlight) {
      var after = surroundMatch(postSep, postPart, pre, post, ignorecase)
        , before
      if (hasTextBeforeSeparator) {
        before = surroundMatch(preSep, prePart, pre, post, ignorecase)
        appendMatch(before, after)
      } else {
        appendMatch("", after)
      }
    } else {
      appendMatch(preSep, postSep)
    }
  }
  return matches
}

// Returns a String to be turned into a RegExp.
function makePattern(pattern) {
  var chars = pattern.split("")
    , regex = []
    , char
  for (var i = 0; i < chars.length; i++) {
    char = (chars[i] == "\\") ? "\\\\" : chars[i]
    regex.push("([" + char + "])")
  }
  return regex.join("[^/]*?")
}

// Examples
// 
//   surroundMatch "cheese", "cs", "<b>", "</b>"
//   // => "<b>c</b>hee<b>s</b>e"
// 
// Returns String.
function surroundMatch(string, pattern, pre, post, ignorecase) {
  pattern = pattern.split("")
  var nextChar = pattern.shift()
    , chars = string.split("")
    , done = ""
    , char, sameChar

  for (var i = 0; i < chars.length; i++) {
    char = chars[i]
    if (nextChar) {
      sameChar = false
      if (ignorecase && char.toLowerCase() === nextChar.toLowerCase()) {
        sameChar = true
      } else if (!ignorecase && char === nextChar) {
        sameChar = true
      }

      if (sameChar) {
        done += "" + pre + char + post
        nextChar = pattern.shift()
        continue
      }
    }
    done += char
  }
  return done
}
