const expect = require('chai').expect;
const lens = require('../src/index').lens;

describe('lens', () => {

    it('provide a getter for the given object property', () => {
        const o1 = {a: 1},
            o2 = {a: 5},
            aL = lens('a');

        expect(aL.get(o1)).to.equal(1);
        expect(aL.get(o2)).to.equal(5);
    });

    it('provide a setter for the given object property', () => {
        const o1 = {a: 1},
            o2 = {a: 5},
            aL = lens('a');
        const o1_ = aL.set(o1, 2);
        const o1__ = aL.set(o1_, 3);
        const o2_ = aL.set(o2, 6);

        expect(o1__.a).to.equal(3);
        expect(o1_.a).to.equal(2);
        expect(o1.a).to.equal(1);
        expect(o2.a).to.equal(5);
        expect(o2_.a).to.equal(6);
    });

    it('should combine with another lens to provide access to nested fields', () => {
        const o1 = {
            a: {
                x: 'hi',
                y: 'hello'
            },
            b: 123
        };
        const o2 = {
            x: {
                a: 1,
                b: 2
            },
            y: 321
        };
        const aL = lens('a'),
            xL = lens('x'),
            axL = aL.combine(xL),
            xaL = xL.combine(aL);

        const o1_ = axL.set(o1, 'test');
        const o2_ = xaL.set(o2, 9000);

        expect(o1_.a.x).to.equal('test');
        expect(o2_.x.a).to.equal(9000);
    });
});