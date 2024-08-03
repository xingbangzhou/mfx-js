import Matrix4 from "./Matrix4"

export default class Vector3 {
    constructor (x = 0, y = 0, z = 0) {
        Vector3.prototype['isVector3'] = true

        this.x = x
        this.y = y
        this.z = z
    }

    x: number
    y: number
    z: number

    set(x: number, y: number, z?: number) {
        if (z=== undefined) z = this.z

        this.x = x
        this.y = y
        this.z = z
    }

    clone() {
        return new Vector3(this.x, this.y, this.z)
    }

    copy(v: Vector3) {
        this.x = v.x
        this.y = v.y
        this.z = v.z

        return this
    }

    add(v: Vector3) {
        this.x += v.x
        this.y += v.y
        this.z += v.z

        return this
    }

    sub(v: Vector3) {
        this.x -= v.x
        this.y -= v.y
        this.z -= v.z

        return this
    }

    multiply( v: Vector3 ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

    multiplyScalar( scalar: number ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

    applyMatrix4(m: Matrix4) {
        const x = this.x, y = this.y, z = this.z
        const e = m.elements

        const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

        return this
    }

    divide( v: Vector3 ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar( scalar: number ) {

		return this.multiplyScalar( 1 / scalar );

	}

    min( v: Vector3 ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	max( v: Vector3 ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	clamp( min: Vector3, max: Vector3 ) {

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

    floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

    trunc() {

		this.x = Math.trunc( this.x );
		this.y = Math.trunc( this.y );
		this.z = Math.trunc( this.z );

		return this;

	}

    negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	dot( v: Vector3 ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

    length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

    normalize() {

		return this.divideScalar( this.length() || 1 );

	}

    cross(v: Vector3) {
        return this.crossVectors( this, v )
    }

    crossVectors( a: Vector3, b: Vector3 ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

    fromArray(array: number[], offset = 0) {
        this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;
    }

    toArray(array = [] as number[], offset = 0) {
        array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;
    }

    *[ Symbol.iterator ]() {
        yield this.x;
        yield this.y;
        yield this.z;
    }
}