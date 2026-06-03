if (typeof window !== 'undefined') {
  // globalThis (Chrome 71+)
  if (typeof globalThis === 'undefined') {
    window.globalThis = window
  }

  // Promise.allSettled (Chrome 76+)
  if (!Promise.allSettled) {
    Promise.allSettled = function (iterable) {
      return Promise.all(
        Array.from(iterable).map(function (p) {
          return Promise.resolve(p).then(
            function (value) { return { status: 'fulfilled', value: value } },
            function (reason) { return { status: 'rejected', reason: reason } }
          )
        })
      )
    }
  }

  // Array.prototype.flatMap (Chrome 69+)
  if (!Array.prototype.flatMap) {
    Object.defineProperty(Array.prototype, 'flatMap', {
      value: function (callback, thisArg) {
        return this.reduce(function (acc, x, i, arr) {
          return acc.concat(callback.call(thisArg, x, i, arr))
        }, [])
      },
      configurable: true,
      writable: true,
    })
  }

  // String.prototype.trimEnd (Chrome 66+)
  if (!String.prototype.trimEnd) {
    String.prototype.trimEnd = function () {
      return this.replace(/[\s﻿\xA0]+$/, '')
    }
  }

  // String.prototype.trimStart (Chrome 66+)
  if (!String.prototype.trimStart) {
    String.prototype.trimStart = function () {
      return this.replace(/^[\s﻿\xA0]+/, '')
    }
  }

  // Object.hasOwn (Chrome 93+)
  if (!Object.hasOwn) {
    Object.hasOwn = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop)
    }
  }

  // Object.fromEntries (Chrome 73+)
  if (!Object.fromEntries) {
    Object.fromEntries = function (iterable) {
      var obj = {}
      // Handle arrays and array-likes
      if (Array.isArray(iterable)) {
        for (var i = 0; i < iterable.length; i++) {
          obj[iterable[i][0]] = iterable[i][1]
        }
      }
      return obj
    }
  }

  // ResizeObserver stub (Chrome 64+) - markmap-view uses it internally
  if (typeof ResizeObserver === 'undefined') {
    window.ResizeObserver = function (callback) {
      return {
        observe: function () {},
        unobserve: function () {},
        disconnect: function () {},
      }
    }
  }

  // Constructable CSSStyleSheet (Chrome 73+) — Mermaid uses it for themes
  // Chrome 63 has CSSStyleSheet but it's NOT constructable; must test with try/catch
  try { new window.CSSStyleSheet() } catch (e) {
    var _CSSStyleSheet = window.CSSStyleSheet
    window.CSSStyleSheet = function () {
      var el = document.createElement('style')
      document.head.appendChild(el)
      return {
        insertRule: function (rule, index) { return el.sheet.insertRule(rule, index) },
        deleteRule: function (index) { el.sheet.deleteRule(index) },
        get cssRules() { return el.sheet.cssRules },
        replace: function (text) { el.textContent = text; return Promise.resolve() },
        replaceSync: function (text) { el.textContent = text },
      }
    }
    // Preserve static methods/properties
    if (_CSSStyleSheet) {
      Object.keys(_CSSStyleSheet).forEach(function (k) {
        window.CSSStyleSheet[k] = _CSSStyleSheet[k]
      })
    }
  }

  // Patch querySelector/querySelectorAll to strip :where() (Chrome 88+)
  // Only wrap if :where() is unsupported — test via try/catch
  ;(function () {
    try { document.querySelector(':where(*)') } catch (e) {
      var WHERE_RE = /:where\(([^)]+)\)/g
      function fix(s) { return WHERE_RE.test(s) ? s.replace(WHERE_RE, '$1') : s }
      var _qsa = Document.prototype.querySelectorAll
      Document.prototype.querySelectorAll = function (s) { return _qsa.call(this, fix(s)) }
      var _qs = Document.prototype.querySelector
      Document.prototype.querySelector = function (s) { return _qs.call(this, fix(s)) }
      var _eqsa = Element.prototype.querySelectorAll
      Element.prototype.querySelectorAll = function (s) { return _eqsa.call(this, fix(s)) }
      var _eqs = Element.prototype.querySelector
      Element.prototype.querySelector = function (s) { return _eqs.call(this, fix(s)) }
    }
  })()

}
