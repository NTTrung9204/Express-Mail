class Product {
  final int id;
  final String name;
  final int quantity;
  final double weight;
  final String imgUrl;

  Product({
    required this.id,
    required this.name,
    required this.quantity,
    required this.weight,
    required this.imgUrl,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      quantity: json['quantity'] ?? 0,
      weight: (json['weight'] ?? 0).toDouble(),
      imgUrl: json['img_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'quantity': quantity,
      'weight': weight,
      'img_url': imgUrl,
    };
  }
}
