import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from "material-ui/List";
import withTheme from "material-ui/styles/withTheme";
import Collapse from "material-ui/transitions/Collapse";
import IconButton from "material-ui/IconButton";
import Button from "material-ui/Button";
import Divider from "material-ui/Divider";
import Avatar from "material-ui/Avatar";

import CopyIcon from "material-ui-icons/ContentCopy";
import Share from "material-ui-icons/Share";

import PaymentListItem from "./PaymentListItem";
import { humanReadableDate, formatMoney } from "../../Helpers/Utils";

const styles = {
    actionListItem: {
        padding: 16,
        marginTop: 16
    },
    smallAvatar: {
        width: 50,
        height: 50
    }
};

class BunqMeTabListItem extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            extraInfoOpen: false,
            paymentsOpen: false
        };
    }

    toggleExtraInfo = () => {
        this.setState({ extraInfoOpen: !this.state.extraInfoOpen });
    };

    togglePayments = () => {
        this.setState({ paymentsOpen: !this.state.paymentsOpen });
    };

    cancelTab = () => {
        const { bunqMeTab, user } = this.props;
        this.props.bunqMeTabPut(
            user.id,
            bunqMeTab.monetary_account_id,
            bunqMeTab.id
        );
    };

    render() {
        const { bunqMeTab, theme } = this.props;

        let iconColor = null;
        let canBeCanceled = false;
        switch (bunqMeTab.status) {
            case "CANCELLED":
                iconColor = theme.palette.bunqMeTabs.cancelled;
                break;
            case "EXPIRED":
                iconColor = theme.palette.bunqMeTabs.expired;
                break;
            case "WAITING_FOR_PAYMENT":
            default:
                canBeCanceled = true;
                iconColor = theme.palette.bunqMeTabs.awaiting_payment;
                break;
        }
        const shareUrl = bunqMeTab.bunqme_tab_share_url;
        const createdDate = humanReadableDate(bunqMeTab.created);
        const updatedDate = humanReadableDate(bunqMeTab.updated);
        const expiryDate = humanReadableDate(bunqMeTab.time_expiry);
        const numberOfPayments = bunqMeTab.result_inquiries.length;

        const primaryText = `${formatMoney(
            bunqMeTab.bunqme_tab_entry.amount_inquired.value
        )} ${bunqMeTab.bunqme_tab_entry.amount_inquired.currency}`;

        const merchantList = bunqMeTab.bunqme_tab_entry.merchant_available
            .filter(merchant => merchant.available)
            .map(merchant => merchant.merchant_type)
            .join(", ");

        const bunqMeTabPayments = bunqMeTab.result_inquiries;

        return [
            <ListItem button onClick={this.toggleExtraInfo}>
                <Avatar style={styles.smallAvatar}>
                    <Share color={"inherit"} style={{ color: iconColor }} />
                </Avatar>
                <ListItemText
                    primary={primaryText}
                    secondary={bunqMeTab.bunqme_tab_entry.description}
                />
                <ListItemSecondaryAction>
                    <CopyToClipboard
                        text={shareUrl}
                        onCopy={this.props.copiedValue("the bunq.me tab url")}
                    >
                        <IconButton aria-label="Copy the share url">
                            <CopyIcon />
                        </IconButton>
                    </CopyToClipboard>
                </ListItemSecondaryAction>
            </ListItem>,
            <Collapse in={this.state.extraInfoOpen} unmountOnExit>
                <ListItem dense>
                    <ListItemText primary={`Created`} secondary={createdDate} />
                </ListItem>

                {updatedDate !== createdDate ? (
                    <ListItem dense>
                        <ListItemText
                            primary={`Updated`}
                            secondary={updatedDate}
                        />
                    </ListItem>
                ) : null}

                <ListItem dense>
                    <ListItemText primary={`Expires`} secondary={expiryDate} />
                </ListItem>

                <ListItem dense>
                    <ListItemText
                        primary="Available merchants"
                        secondary={merchantList}
                    />
                </ListItem>

                <ListItem button dense onClick={this.togglePayments}>
                    <ListItemText
                        primary="Number of payments"
                        secondary={"" + numberOfPayments}
                    />
                </ListItem>
                <Collapse in={this.state.paymentsOpen} unmountOnExit>
                    {bunqMeTabPayments.map(bunqMeTabPayment => {
                        return (
                            <PaymentListItem
                                payment={bunqMeTabPayment.payment.Payment}
                                BunqJSClient={this.props.BunqJSClient}
                            />
                        );
                    })}
                </Collapse>

                <ListItem style={styles.actionListItem}>
                    <ListItemSecondaryAction>
                        {canBeCanceled ? (
                            <Button
                                raised
                                disabled={
                                    this.props.bunqMeTabLoading ||
                                    this.props.bunqMeTabsLoading
                                }
                                color="secondary"
                                onClick={this.cancelTab}
                            >
                                Cancel request
                            </Button>
                        ) : null}
                    </ListItemSecondaryAction>
                </ListItem>
            </Collapse>,
            <Divider />
        ];
    }
}

export default withTheme()(BunqMeTabListItem);
