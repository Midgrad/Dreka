#ifndef WAYPOINT_CONTROLLER_H
#define WAYPOINT_CONTROLLER_H

#include "i_routes_repository.h"

namespace md::presentation
{
class WaypointEditController : public QObject
{
    Q_OBJECT

public:
    explicit WaypointEditController(QObject* parent = nullptr);

private:
    domain::IRoutesRepository* const m_routesRepository;
};
} // namespace md::presentation

#endif // WAYPOINT_CONTROLLER_H
