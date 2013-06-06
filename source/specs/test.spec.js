describe("Asynchronous specs", function() {
  var value, flag;

  it("should support async execution of test preparation and exepectations", function() {
    runs(function() {
      flag = false;
      value = 0;

      setTimeout(function() {
        flag = true;
      }, 100);
    });
    
    waitsFor(function() {
      value++;
      return flag;
    }, "The Value should be incremented", 150);
    
    runs(function() {
      expect(value).toBeGreaterThan(0);
      expect(flag).toEqual(true);
    });
  });
});