class RouteStep {
  final String id;
  final int stepOrder;
  final String type;
  final int jobId;
  final double lat;
  final double lng;
  final int arrival;
  final int duration;
  final int distance;
  final int load;
  final int serviceTime;
  final int waitingTime;
  final String status;
  final String createdAt;

  RouteStep({
    required this.id,
    required this.stepOrder,
    required this.type,
    required this.jobId,
    required this.lat,
    required this.lng,
    required this.arrival,
    required this.duration,
    required this.distance,
    required this.load,
    required this.serviceTime,
    required this.waitingTime,
    required this.status,
    required this.createdAt,
  });

  factory RouteStep.fromJson(Map<String, dynamic> json) {
    return RouteStep(
      id: json['id'] ?? '',
      stepOrder: json['stepOrder'] ?? 0,
      type: json['type'] ?? '',
      jobId: json['jobId'] ?? 0,
      lat: (json['lat'] ?? 0).toDouble(),
      lng: (json['lng'] ?? 0).toDouble(),
      arrival: json['arrival'] ?? 0,
      duration: json['duration'] ?? 0,
      distance: json['distance'] ?? 0,
      load: json['load'] ?? 0,
      serviceTime: json['serviceTime'] ?? 0,
      waitingTime: json['waitingTime'] ?? 0,
      status: json['status'] ?? '',
      createdAt: json['createdAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'stepOrder': stepOrder,
      'type': type,
      'jobId': jobId,
      'lat': lat,
      'lng': lng,
      'arrival': arrival,
      'duration': duration,
      'distance': distance,
      'load': load,
      'serviceTime': serviceTime,
      'waitingTime': waitingTime,
      'status': status,
      'createdAt': createdAt,
    };
  }
}
