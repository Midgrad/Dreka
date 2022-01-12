#ifndef ROUTE_PATTERN_CONTROLLER_H
#define ROUTE_PATTERN_CONTROLLER_H

#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class RoutePatternController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant pattern READ pattern NOTIFY patternChanged)
    Q_PROPERTY(QVariant routeId READ routeId WRITE selectRoute NOTIFY routeChanged)
    Q_PROPERTY(QJsonArray coordinates READ coordinates NOTIFY coordinatesChanged)
    Q_PROPERTY(bool ready READ ready NOTIFY readyChanged)

public:
    explicit RoutePatternController(QObject* parent = nullptr);

    QVariant routeId() const;
    QVariant pattern() const;
    QJsonArray coordinates() const;
    bool ready() const;

public slots:
    void selectRoute(const QVariant& routeId);
    void createPattern(const QString& patternId);
    void cancel();
    void apply();

signals:
    void patternChanged();
    void routeChanged();
    void coordinatesChanged();
    void readyChanged();

private:
    domain::IRoutesService* const m_routesService;
    domain::Route* m_route = nullptr;
    const domain::RoutePattern* m_pattern = nullptr;
    QList<domain::Geodetic> m_coordinates;
};
} // namespace md::presentation

#endif // ROUTE_PATTERN_CONTROLLER_H
