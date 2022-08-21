#ifndef COMM_LINK_EDIT_CONTROLLER_H
#define COMM_LINK_EDIT_CONTROLLER_H

#include "i_comm_links_service.h"

#include <QJsonArray>

namespace md::presentation
{
class CommLinkEditController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant linkId READ linkId WRITE selectLink NOTIFY linkChanged)
    Q_PROPERTY(QVariantMap link READ link NOTIFY linkChanged)

    Q_PROPERTY(QVariantList typeParameters READ typeParameters NOTIFY linkChanged)
    Q_PROPERTY(QVariantMap itemParameters READ itemParameters NOTIFY linkChanged)

    Q_PROPERTY(QVariantList protocols READ protocols NOTIFY protocolsChanged)

public:
    explicit CommLinkEditController(QObject* parent = nullptr);

    QVariant linkId() const;
    QVariantMap link() const;

    QVariantList typeParameters() const;
    QVariantMap itemParameters() const;

    QVariantList protocols() const;

public slots:
    void selectLink(const QVariant& linkId);

    void remove();
    void connectDisconectLink(bool connect);
    void rename(const QString& newName);

    void setParameter(const QString& parameterId, const QVariant& value);
    void setProtocol(const QString& protocolId);

signals:
    void linkChanged();
    void protocolsChanged();

private:
    domain::ICommLinksService* const m_commLinks;
    domain::CommLink* m_link = nullptr;
};
} // namespace md::presentation

#endif // COMM_LINK_EDIT_CONTROLLER_H
