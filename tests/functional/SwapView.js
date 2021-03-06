define([
	"intern", "intern!object", "intern/dojo/node!leadfoot/helpers/pollUntil", "intern/chai!assert",
	"intern/dojo/node!leadfoot/keys", "require"
], function (intern, registerSuite, pollUntil, assert, keys, require) {

	function loadFile(remote, url) {
		return remote
			.get(require.toUrl(url))
			.then(pollUntil("return ready ? true : null;", [],
				intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
	}

	function getTransformX(v) {
		var m = v.match(/matrix\(.*,.*,.*,.*,\s*(.*)\s*,.*\)/);
		if (m && m.length > 0) {
			return m[1];
		} else {
			m = v.match(/matrix3d\(.*,.*,.*,.*,.*,.*,.*,.*,.*,.*,.*,.*,\s*(.*)\s*,.*,.*,.*\)/);
			if (m && m.length > 0) {
				return m[1];
			} else {
				return "unknown transform";
			}
		}
	}
	
	registerSuite({
		name: "SwapView - functional",

		"SwapView load": function () {
			var remote = this.remote;
			return loadFile(remote, "./SwapView.html").findById("sv").then(function () {
				pollUntil("return document.getElementById('sv').className == 'd-swap-view d-view-stack'", [], 2000,
					intern.config.POLL_INTERVAL);
			})
				.execute("return document.getElementById('sv').children.length;")
				.then(function (v) {
					assert.equal(v, 3, "Wrong number of children in SwapView");
				})
			;
		},

		"ViewIndicator click dot": function () {
			var remote = this.remote;
			if (this.remote.environmentType.platformName === "iOS") {
				// https://github.com/theintern/leadfoot/issues/17
				return this.skip("clicking dot on iOS works manually, but not via webdriver");
			}
			return remote
				.findByCssSelector("#vi > *:nth-child(3)")
				.click()
				.sleep(500)
				.execute("return document.getElementById('vi').children[0].className;")
				.then(function (v) {
					assert.include(v, "-d-view-indicator-dot", "Missing class for vi child 0");
					assert.notInclude(v, "-d-view-indicator-dot-selected", "Extra class for vi child 0");
				})
				.execute("return document.getElementById('vi').children[1].className;")
				.then(function (v) {
					assert.include(v, "-d-view-indicator-dot", "Missing class for vi child 1");
					assert.notInclude(v, "-d-view-indicator-dot-selected", "Extra class for vi child 1");
				})
				.execute("return document.getElementById('vi').children[2].className;")
				.then(function (v) {
					assert.include(v, "-d-view-indicator-dot", "Missing class for vi child 2");
					assert.include(v, "-d-view-indicator-dot-selected", "Missing class for vi child 2");
				})
				;
		}
	});
});
