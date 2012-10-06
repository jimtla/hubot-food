var should = require('should')
  , fuzzy  = require(__dirname + '/..')

describe("fuzzy-filter", function() {
  describe("basic usage", function() {
    var items = fuzzy("cs",
      [ "cheese"
      , "crackers"
      , "pirate attack" ])
    
    it("returns an Array", function() {
      items.should.be.an.instanceof(Array)
    })
    
    it("filters the items", function() {
      items.should.eql(["cheese", "crackers"])
    })
  })
  
  describe("ignorecase", function() {
    describe("is true by default", function() {
      describe("when the pattern has mismatched caps", function() {
        var items = fuzzy("CS",
          [ "cheese"
          , "crackers"
          , "pirate attack" ])
        
        it("filters the items", function() {
          items.should.eql(["cheese", "crackers"])
        })
      })
      
      describe("when the items have mismatched caps", function() {
        var items = fuzzy("cs",
          [ "CHEESE"
          , "crackers"
          , "pirate attack"
          ], {pre: "<b>", post: "</b>"})
        
        it("filters the items", function() {
          items.should.eql(["<b>C</b>HEE<b>S</b>E", "<b>c</b>racker<b>s</b>"])
        })
      })
    })
    
    describe("when false", function() {
      var items = fuzzy("CS",
        [ "cheese"
        , "crackers"
        , "pirate attack"
        ], {ignorecase: false})
      
      it("filters the items", function() {
        items.should.eql([])
      })
    })
  })
  
  describe("ignorespace", function() {
    describe("is true by default", function() {
      var items = fuzzy("c s",
        [ "cheese"
        , "crackers"
        , "pirate attack" ])
      
      it("filters the items", function() {
        items.should.eql(["cheese", "crackers"])
      })
    })
    
    describe("when false", function() {
      var items = fuzzy("c s",
        [ "cheese"
        , "crackers"
        , "pirate attack"
        ], {ignorespace: false})
      
      it("filters the items", function() {
        items.should.eql([])
      })
    })
  })
  
  describe("limit", function() {
    var items = fuzzy("1",
      [ "123"
      , "abc"
      , "123"
      , "123"
      ], {limit: 2})
    it("limits the number of items matched", function() {
      items.length.should.eql(2)
    })
  })
  
  describe("filter by backslash", function() {
    it("does not error", function() {
      (function() {
        fuzzy("foo\\", ["123", "abc"])
      }).should.not.throw()
    })
  })

  describe("when nothing matches", function() {
    var items = fuzzy("bla",
      [ "cheese"
      , "pickles"
      , "crackers"
      , "pirate attack" ])
    
    it("returns []", function() {
      items.should.eql([])
    })
  })
  
  describe("beginning-of-text match", function() {
    var items = fuzzy("cs",
      [ "cheese"
      , "crackers"
      , "pirate attack"
      , "cs!!" ])
    
    it("puts the beginning-of-text match first", function() {
      items.should.eql(["cs!!", "cheese", "crackers"])
    })
  })
  
  describe("with pre/post options", function() {
    var items = fuzzy("cs",
      [ "cheese"
      , "crackers"
      , "pirate attack"
      , "cs!!"
      ] , {pre:  "<b>", post: "</b>"})
    it("bolds the items", function() {
      items.should.eql(
        [ "<b>cs</b>!!"
        , "<b>c</b>hee<b>s</b>e"
        , "<b>c</b>racker<b>s</b>"
        ])
    })
  })
  
  describe("with a separator", function() {
    describe("when the separator is not in the pattern", function() {
      it("matches against the last segment", function() {
        var items = fuzzy("cs",
          [ "cookies"
          , "cheese/pie"
          , "fried/cheese"
          , "cheese/cookies"
          ],
          { pre:       "<b>"
          , post:      "</b>"
          , separator: "/"
          })
        items.should.eql(
        [ "<b>c</b>ookie<b>s</b>"
        , "fried/<b>c</b>hee<b>s</b>e"
        , "cheese/<b>c</b>ookie<b>s</b>" ])
      })
      
      it("matches against only the last segment", function() {
        var items = fuzzy("foo",
        [ "foo/bar"
        , "bar/foo"
        ], {separator: "/"})
        items.should.eql(["bar/foo"])
      })
    })
    
    describe("when the pattern contains the separator", function() {
      var items = fuzzy("cs/",
        [ "cookies"
        , "cheese/pie"
        , "fried/cheese"
        , "cheese/cookies"
        ],
        { pre:       "<b>"
        , post:      "</b>"
        , separator: "/"
        })
      it("matches the first part of the string", function() {
        items.should.eql(
          [ "<b>c</b>hee<b>s</b>e/pie"
          , "<b>c</b>hee<b>s</b>e/cookies" ])
      })
    })
    
    describe("and text before and after", function() {
      var items = fuzzy("cs/p",
        [ "cookies"
        , "cheese/pie"
        , "fried/cheese"
        , "cheese/cookies"
        ],
        { pre:       "<b>"
        , post:      "</b>"
        , separator: "/"
        })
      it("filters both parts", function() {
        items.should.eql(["<b>c</b>hee<b>s</b>e/<b>p</b>ie"])
      })
    })
    
    describe("when `separate` is true", function() {
      describe("basic match", function() {
        var items = fuzzy("cs",
          [ "a/cheese"
          , "b/crackers"
          , "c/pirate attack"
          ], {separate: true, separator: "/"})
        
        it("filters the items", function() {
          items.should.eql([["a", "cheese"], ["b", "crackers"]])
        })
      })
      
      describe("with pattern text before and after the separator", function() {
        var items = fuzzy("cs/p",
          [ "cookies"
          , "cheese/pie"
          , "fried/cheese"
          , "cheese/cookies"
          ]
        , { pre:       "<b>"
          , post:      "</b>"
          , separator: "/"
          , separate:  true
          })
        
        it("is an Array of Array of String", function() {
          items.should.be.an.instanceof(Array)
          items[0].should.be.an.instanceof(Array)
          items[0][0].should.be.a("string")
        })
        
        it("filters both parts", function() {
          items.should.eql([ ["<b>c</b>hee<b>s</b>e", "<b>p</b>ie"] ])
        })
      })
      
      describe("beginning-of-text match", function() {
        var items = fuzzy("cs",
          [ "cheese"
          , "crackers"
          , "pirate attack"
          , "cs!!"
          ], {separate: true, separator: "/"})
        
        it("puts the beginning-of-text match first", function() {
          items.should.eql(
            [ ["", "cs!!"]
            , ["", "cheese"]
            , ["", "crackers"] ])
        })
      })
      
      describe("when `separator` is not passed", function() {
        it("throws", function() {
          should.throws(function() {
            fuzzy("cs", ["cheese"], {separate: true})
          })
        })
      })
    })
  })
})
