#ifndef COMM_LINK_LIST_CONTROLLER_H
#define COMM_LINK_LIST_CONTROLLER_H

#include "i_comm_links_service.h"

#include <QJsonArray>

namespace md::presentation
{
class CommLinkListController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariantList commLinkTypes READ commLinkTypes NOTIFY commLinkTypesChanged)
    Q_PROPERTY(QJsonArray commLinks READ commLinks NOTIFY commLinksChanged)

public:
    explicit CommLinkListController(QObject* parent = nullptr);

    QVariantList commLinkTypes() const;
    QJsonArray commLinks() const;

    Q_INVOKABLE QJsonObject commLink(const QVariant& commLinkId) const;

public slots:
    void addCommLink(const QString& typeId);
    void remove(const QVariant& commLinkId);
    void connectDiscconectLink(const QVariant& commLinkId, bool connect);
    void rename(const QVariant& commLinkId, const QString& name);

signals:
    void commLinkTypesChanged();
    void commLinksChanged();
    void commLinkChanged(QVariant commLinkId, QVariantMap commLink);

private slots:
    void onCommLinkAdded(domain::CommLink* commLink);
    void onCommLinkRemoved(domain::CommLink* commLink);

private:
    domain::ICommLinksService* const m_commLinks;
};
} // namespace md::presentation

#endif // COMM_LINK_LIST_CONTROLLER_H
