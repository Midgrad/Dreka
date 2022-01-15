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
    Q_PROPERTY(QJsonObject patternParameters READ patternParameters NOTIFY patternChanged)
    Q_PROPERTY(QJsonArray areaPositions READ areaPositions NOTIFY areaPositionsChanged)
    Q_PROPERTY(QJsonArray pathPositions READ pathPositions NOTIFY pathPositionsChanged)
    Q_PROPERTY(bool ready READ ready NOTIFY readyChanged)

public:
    explicit RoutePatternController(QObject* parent = nullptr);

    QVariant routeId() const;
    QVariant pattern() const;
    QJsonObject patternParameters() const;
    QJsonArray areaPositions() const;
    QJsonArray pathPositions() const;
    bool ready() const;

    Q_INVOKABLE QJsonArray typeParameters(const QString& typeId);

public slots:
    void selectRoute(const QVariant& routeId);
    void createPattern(const QString& patternTypeId);
    void setParameter(const QString& parameterId, const QVariant& value);
    void setAreaPositions(const QVariantList& positions);
    void cancel();
    void apply();

signals:
    void patternChanged();
    void routeChanged();
    void areaPositionsChanged();
    void pathPositionsChanged();
    void readyChanged();

private:
    domain::IRoutesService* const m_routesService;
    domain::Route* m_route = nullptr;
    domain::RoutePattern* m_pattern = nullptr;
};
} // namespace md::presentation

#endif // ROUTE_PATTERN_CONTROLLER_H
