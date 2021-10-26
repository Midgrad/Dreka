#ifndef ROUTES_CONTROLLER_H
#define ROUTES_CONTROLLER_H

#include "i_routes_repository.h"

namespace md::presentation
{
class RoutesController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariantList routes READ routes NOTIFY routesChanged)
    Q_PROPERTY(
        QVariant selectedRoute READ selectedRoute WRITE selectRoute NOTIFY selectedRouteChanged)
    Q_PROPERTY(QStringList routeTypes READ routeTypes NOTIFY routeTypesChanged)

public:
    explicit RoutesController(QObject* parent = nullptr);

    QVariantList routes() const;
    QVariant selectedRoute() const;
    QStringList routeTypes() const;

    Q_INVOKABLE QJsonObject route(const QVariant& routeId) const;

public slots:
    void addNewRoute(const QString& routeType);
    void selectRoute(const QVariant& selectedRoute);
    void save(const QVariant& routeId, const QJsonObject& data);
    void remove(const QVariant& routeId);

signals:
    void routesChanged();
    void routeTypesChanged();

    void routeAdded(QVariant routeId);
    void routeRemoved(QVariant routeId);
    void routeChanged(QVariant routeId);

    void centerRoute(QVariant routeId);
    void selectedRouteChanged(QVariant routeId);
    void centerWaypoint(QVariant routeId, int index);

private slots:
    void onRouteAdded(domain::Route* route);
    void onRouteRemoved(domain::Route* route);

private:
    domain::IRoutesRepository* const m_routesRepository;
    QVariant m_selectedRoute;
};
} // namespace md::presentation

#endif // ROUTES_CONTROLLER_H
