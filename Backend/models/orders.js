// cartItems.js
const db = require('../util/database');

class Orders {
  constructor(id, first_name, last_name, quantity,   product_id, user_id) {
    this.id = id;
    this.product_id = product_id;
    this.user_id = user_id;
  }

  async save() {
    const [result] = await db.execute(
      'INSERT INTO orders (product_id, user_id) VALUES ( ?, ?)',
      [this.product_id, this.user_id]
      );
      this.id = result.insertId;
    }
    static async deleteById(product_id, user_id) {
      await db.execute('DELETE FROM orders WHERE product_id = ? AND user_id = ?', [user_id, product_id]);
    }

  static async fetchUserWishlist(user_id) {
    const [rows] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ?',
      [user_id]
    );
    return rows;  
  }

  static async productExist(product_id, user_id) {
    const [rows] = await db.execute(
      'SELECT * FROM orders WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );
    return rows;
  }

  static async findById(user_id, product_id) {
    const [rows] = await db.execute('SELECT * FROM orders WHERE product_id = ? AND user_id = ?', [product_id, user_id]);
    return rows[0];
  }
  
}

module.exports = Orders;
