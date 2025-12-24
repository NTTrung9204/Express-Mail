import { RoutePlan } from '../entities/route-plan.entity';
import { VehicleRoute } from '../entities/vehicle-route.entity';
import { RouteStep } from '../entities/route-step.entity';

export function sanitizeRoutePlans(routePlans: RoutePlan[]) {
  return routePlans.map((rp) => ({
    id: rp.id,
    postOfficeId: rp.postOfficeId,
    totalCost: rp.totalCost,
    totalDistance: rp.totalDistance,
    totalDuration: rp.totalDuration,
    totalServiceTime: rp.totalServiceTime,
    unassignedCount: rp.unassignedCount,
    createdAt: rp.createdAt,
    vehicleRoutes: rp.vehicleRoutes?.map((vr) => ({
      id: vr.id,
      vehicleId: vr.vehicleId,
      cost: vr.cost,
      distance: vr.distance,
      duration: vr.duration,
      serviceTime: vr.serviceTime,
      // geometry intentionally omitted
      createdAt: vr.createdAt,
      routeSteps: vr.routeSteps?.map(sanitizeRouteStep),
    })),
  }));
}

export function sanitizeVehicleRoute(vr: VehicleRoute) {
  return {
    id: vr.id,
    vehicleId: vr.vehicleId,
    cost: vr.cost,
    distance: vr.distance,
    duration: vr.duration,
    serviceTime: vr.serviceTime,
    createdAt: vr.createdAt,
    routePlan: vr.routePlan
      ? {
          id: vr.routePlan.id,
          postOfficeId: vr.routePlan.postOfficeId,
          totalCost: vr.routePlan.totalCost,
          totalDistance: vr.routePlan.totalDistance,
          totalDuration: vr.routePlan.totalDuration,
          totalServiceTime: vr.routePlan.totalServiceTime,
          unassignedCount: vr.routePlan.unassignedCount,
          createdAt: vr.routePlan.createdAt,
        }
      : undefined,
    routeSteps: vr.routeSteps?.map(sanitizeRouteStep),
  };
}

export function sanitizeRouteStep(step: RouteStep) {
  return {
    id: step.id,
    stepOrder: step.stepOrder,
    type: step.type,
    jobId: step.jobId,
    lat: step.lat,
    lng: step.lng,
    arrival: step.arrival,
    duration: step.duration,
    distance: step.distance,
    load: step.load,
    serviceTime: step.serviceTime,
    waitingTime: step.waitingTime,
    createdAt: step.createdAt,
  };
}
