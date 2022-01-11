#ifndef ROUTE_PATTERN_CONTROLLER_H
#define ROUTE_PATTERN_CONTROLLER_H

#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class RoutePatternController : public QObject
{
    Q_OBJECT

public:
    explicit RoutePatternController(QObject* parent = nullptr);

private:
    domain::IRoutesService* const m_routesService;
};
} // namespace md::presentation

#endif // ROUTE_PATTERN_CONTROLLER_H
